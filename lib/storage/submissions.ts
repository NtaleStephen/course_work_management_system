import { createAdminClient } from "@/lib/auth/admin-client";

export const SUBMISSIONS_BUCKET = "submissions";

export const MAX_SUBMISSION_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

// business-logic.md §12: only PDF and .docx are supported -- no legacy .doc.
export const ALLOWED_SUBMISSION_MIME_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
} as const;

export type AllowedSubmissionMimeType =
  keyof typeof ALLOWED_SUBMISSION_MIME_TYPES;

export function isAllowedSubmissionMimeType(
  mimeType: string
): mimeType is AllowedSubmissionMimeType {
  return mimeType in ALLOWED_SUBMISSION_MIME_TYPES;
}

// tech-stack.md §12: generated identifiers in the path, original filename
// preserved only as display metadata (the Submission.fileName column).
export function buildSubmissionPath(params: {
  courseId: string;
  courseworkId: string;
  groupId: string;
  version: number;
  mimeType: AllowedSubmissionMimeType;
}): string {
  const ext = ALLOWED_SUBMISSION_MIME_TYPES[params.mimeType];
  return `course-${params.courseId}/coursework-${params.courseworkId}/group-${params.groupId}/submission-v${params.version}.${ext}`;
}

export async function uploadSubmissionFile(path: string, file: File) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(SUBMISSIONS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw error;
  }
}

export async function deleteSubmissionFile(path: string) {
  const supabase = createAdminClient();
  await supabase.storage.from(SUBMISSIONS_BUCKET).remove([path]);
}
