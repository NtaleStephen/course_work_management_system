export type DerivedSubmissionStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "LATE"
  | "MARKED"
  | "RESULT_PUBLISHED";

// The 5-state status (business-logic.md §14) is always derived from
// Submission.status + Mark presence/status -- never stored directly.
export function deriveSubmissionStatus(row: {
  submission: {
    status: "SUBMITTED" | "LATE";
    mark: { status: "SAVED" | "PUBLISHED" } | null;
  } | null;
}): DerivedSubmissionStatus {
  if (!row.submission) return "NOT_SUBMITTED";
  if (!row.submission.mark) return row.submission.status;
  return row.submission.mark.status === "PUBLISHED"
    ? "RESULT_PUBLISHED"
    : "MARKED";
}
