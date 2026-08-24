import { z } from "zod";

// awarded's upper bound depends on the specific submission's coursework
// maxMarks, which isn't known statically -- callers must re-validate
// 0 <= awarded <= maxMarks themselves after fetching it (the DB also
// enforces this via Mark_awarded_range, as defense in depth).
export const saveMarkSchema = z.object({
  submissionId: z.string().uuid(),
  awarded: z.coerce
    .number({ error: "Enter a mark" })
    .int("Mark must be a whole number")
    .min(0, "Mark cannot be negative"),
  feedback: z.string().trim().max(5000, "Feedback is too long").optional(),
});

export type SaveMarkInput = z.infer<typeof saveMarkSchema>;
