import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "manish";

export interface CustomRequest extends Request {
  userId?: string;
  admin?: string; 
}

export function middleWare(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    let token = req.headers["token"] as string | undefined;
    if (!token) {
      return res.status(403).json({
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    req.userId = decoded.id;
    req.admin = decoded.id;
    
    next();
  } catch (err) {
    return res.status(403).json({
      error: "you are not signed in",
    });
  }
}