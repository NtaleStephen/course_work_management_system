import { z } from "zod";

export const createLecturerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

export type CreateLecturerInput = z.infer<typeof createLecturerSchema>;

export const updateLecturerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});

export type UpdateLecturerInput = z.infer<typeof updateLecturerSchema>;
