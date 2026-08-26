import { z } from "zod";

// The single source of truth for business-logic.md §18's rule
// (0 <= awarded <= maxMarks). Zod can't enforce the upper bound statically
// since maxMarks varies per coursework -- callers re-check this after
// fetching it (the DB's Mark_awarded_range constraint mirrors it too, as
// defense in depth).
export function isValidMark(awarded: number, maxMarks: number): boolean {
  return Number.isInteger(awarded) && awarded >= 0 && awarded <= maxMarks;
}

export const saveMarkSchema = z.object({
  submissionId: z.string().uuid(),
  awarded: z.coerce
    .number({ error: "Enter a mark" })
    .int("Mark must be a whole number")
    .min(0, "Mark cannot be negative"),
  // .nullish() (not just .optional()) -- FormData.get() returns null, not
  // undefined, for an absent key, and a plain .optional() schema rejects null.
  feedback: z.string().trim().max(5000, "Feedback is too long").nullish(),
});

export type SaveMarkInput = z.infer<typeof saveMarkSchema>;
