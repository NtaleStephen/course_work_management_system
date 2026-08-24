import { createAdminClient } from "@/lib/auth/admin-client";
import { SUBMISSIONS_BUCKET } from "@/lib/storage/submissions";

const SIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes

// The bucket is private -- this is the only way to reach a submission file,
// and callers must have already checked authorization before calling this
// (business-logic.md §31, tech-stack.md §13: no public bucket access).
export async function createSubmissionSignedUrl(path: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(SUBMISSIONS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data) {
    throw error ?? new Error("Unable to create signed URL");
  }

  return data.signedUrl;
}
