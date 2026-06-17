import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema, contentValidationSchema, shareValidationSchema } from "./zod.js";
import { userModel, contentModel, linkModel } from "./schema.js";
import { middleWare, JWT_SECRET } from "./middleware.js";
import type { CustomRequest } from "./middleware.js";

const app = express();

app.use(express.json());

// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.post("/signup", async function (req, res) {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues,
        });
    }

    try {
        const { username, password } = result.data;
        
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username,
            password: hashedPassword,
        });

        res.status(201).json({
            id: user._id,
            username: user.username,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error creating user",
            error: err.message,
        });
    }
});

app.post("/signin", async function (req, res) {
    const result = signinSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues,
        });
    }

    try {
        const { username, password } = result.data;
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(403).json({
                message: "Invalid username or password",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(403).json({
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
        res.json({
            token,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error logging in",
            error: err.message,
        });
    }
});

app.post("/content", middleWare, async function (req: CustomRequest, res) {
    const result = contentValidationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues,
        });
    }

    try {
        const { link, title, type, description, tags, tag } = result.data;
        const content = await contentModel.create({
            link: link ?? null,
            title,
            type: type ?? "link",
            description: description ?? "",
            tags: tags ?? (tag ? [tag] : []),
            tag: tag ?? null,
            userId: req.userId!,
        });

        res.status(201).json({
            message: "Content added successfully",
            content,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error creating content",
            error: err.message,
        });
    }
});

app.get("/content", middleWare, async function (req: CustomRequest, res) {
    try {
        const contents = await contentModel.find({ userId: req.userId! }).populate("userId", "username");
        res.json({
            contents,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error fetching content",
            error: err.message,
        });
    }
});

app.delete("/content", middleWare, async function (req: CustomRequest, res) {
    try {
        const contentId = req.body.contentId;
        if (!contentId) {
            return res.status(400).json({
                message: "contentId is required",
            });
        }

        const content = await contentModel.findOne({ _id: contentId, userId: req.userId! });
        if (!content) {
            return res.status(404).json({
                message: "Content not found or unauthorized",
            });
        }

        await contentModel.deleteOne({ _id: contentId });
        res.json({
            message: "Content deleted successfully",
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error deleting content",
            error: err.message,
        });
    }
});

// GET /share — read current share status non-destructively
app.get("/share", middleWare, async function (req: CustomRequest, res) {
    try {
        const existingLink = await linkModel.findOne({ userId: req.userId! });
        if (existingLink) {
            return res.json({ isSharing: true, hash: existingLink.hash });
        }
        return res.json({ isSharing: false, hash: null });
    } catch (err: any) {
        res.status(500).json({ message: "Error fetching share status", error: err.message });
    }
});

app.post("/share", middleWare, async function (req: CustomRequest, res) {
    const result = shareValidationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues,
        });
    }

    try {
        const { share } = result.data;
        if (share) {
            const existingLink = await linkModel.findOne({ userId: req.userId! });
            if (existingLink) {
                return res.json({
                    hash: existingLink.hash,
                });
            }

            const hash = Math.random().toString(36).substring(2, 12);
            await linkModel.create({
                hash,
                userId: req.userId!,
            });

            res.json({
                hash,
            });
        } else {
            await linkModel.deleteOne({ userId: req.userId! });
            res.json({
                message: "Removed shared link",
            });
        }
    } catch (err: any) {
        res.status(500).json({
            message: "Error toggling share link",
            error: err.message,
        });
    }
});

app.get("/:shareLink", async function (req, res) {
    try {
        const hash = req.params.shareLink;
        const link = await linkModel.findOne({ hash });
        if (!link) {
            return res.status(404).json({
                message: "Link not found",
            });
        }

        const contents = await contentModel.find({ userId: link.userId });
        const user = await userModel.findById(link.userId);
        res.json({
            username: user?.username,
            content: contents,
        });
    } catch (err: any) {
        res.status(500).json({
            message: "Error fetching shared content",
            error: err.message,
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
