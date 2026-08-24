import { z } from "zod";

export const courseworkSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  instructions: z.string().trim().min(1, "Instructions are required"),
  maxMarks: z.coerce
    .number({ error: "Maximum marks is required" })
    .int("Maximum marks must be a whole number")
    .positive("Maximum marks must be greater than zero"),
  deadline: z.coerce.date({ error: "Enter a valid deadline" }),
  courseId: z.string().uuid("Select a course"),
  allowLateSubmission: z.boolean(),
  groupIds: z.array(z.string().uuid()).min(1, "Select at least one group"),
});

export type CourseworkInput = z.infer<typeof courseworkSchema>;
