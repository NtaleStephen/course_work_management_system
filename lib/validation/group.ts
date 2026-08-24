import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required"),
  courseId: z.string().uuid("Select a course"),
  leaderName: z.string().trim().min(1, "Leader name is required"),
  leaderEmail: z
    .string()
    .trim()
    .min(1, "Leader email is required")
    .email("Enter a valid email"),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Group name is required"),
  courseId: z.string().uuid("Select a course"),
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
