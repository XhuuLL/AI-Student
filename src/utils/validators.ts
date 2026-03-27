import { z } from "zod";
import { isValidObjectId } from "@/utils/objectId";

export const registerSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().max(120).trim(),
  password: z.string().min(6).max(200),
});

export const loginSchema = z.object({
  email: z.string().email().max(120).trim(),
  password: z.string().min(6).max(200),
});

export const materialIdSchema = z.object({
  materialId: z.string().refine(isValidObjectId, "materialId tidak valid"),
});

export const chatSchema = z.object({
  materialId: z.string().refine(isValidObjectId, "materialId tidak valid"),
  message: z.string().min(1).max(2000).trim(),
});

