import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

if (!MONGO_URL) {
  console.error("Error: MONGO_URL or MONGO_URI environment variable is not defined in the env configuration.");
  process.exit(1);
}

mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const contentSchema = new mongoose.Schema({
    link: { type: String },
    title: { type: String, required: true },
    type: { type: String, enum: ['link', 'note', 'tweet', 'video', 'thought'], required: true, default: 'link' },
    description: { type: String },
    tags: [{ type: String }],
    tag: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const linkSchema = new mongoose.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const userModel = mongoose.model("User", userSchema);
export const contentModel = mongoose.model("Content", contentSchema);
export const linkModel = mongoose.model("Link", linkSchema);
