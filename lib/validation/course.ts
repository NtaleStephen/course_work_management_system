import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().trim().min(1, "Course name is required"),
  code: z.string().trim().min(1, "Course code is required"),
  lecturerId: z.string().uuid("Select a lecturer"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.extend({
  id: z.string().uuid(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
