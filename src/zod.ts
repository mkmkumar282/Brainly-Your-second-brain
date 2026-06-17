import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

export const signinSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export const contentValidationSchema = z.object({
  link: z.string().optional(),
  title: z.string().min(1),
  type: z.enum(['link', 'note', 'tweet', 'video', 'thought']).default('link'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tag: z.string().optional(),
});

export const shareValidationSchema = z.object({
  share: z.boolean(),
});