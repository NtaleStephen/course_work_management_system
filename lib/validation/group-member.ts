import { z } from "zod";

export const addMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  registrationNumber: z.string().trim().min(1, "Registration number is required"),
  course: z.string().trim().min(1, "Course is required"),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

export const updateMemberSchema = addMemberSchema.extend({
  id: z.string().uuid(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
