import { z } from "zod";

export const uploadSubmissionSchema = z.object({
  courseworkId: z.string().uuid(),
});
