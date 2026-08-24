"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { canAccessCoursework } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import { uploadSubmissionSchema } from "@/lib/validation/submission";
import {
  MAX_SUBMISSION_SIZE_BYTES,
  buildSubmissionPath,
  deleteSubmissionFile,
  isAllowedSubmissionMimeType,
  uploadSubmissionFile,
} from "@/lib/storage/submissions";

export type UploadSubmissionState = { error?: string; ok?: boolean };

export async function uploadSubmission(
  _prevState: UploadSubmissionState,
  formData: FormData
): Promise<UploadSubmissionState> {
  const leader = await requireRole("GROUP_LEADER");

  const parsed = uploadSubmissionSchema.safeParse({
    courseworkId: formData.get("courseworkId"),
  });
  if (!parsed.success) {
    return { error: "Invalid request." };
  }
  const { courseworkId } = parsed.data;

  // Re-derives access rather than trusting the page already checked it --
  // this action is a separate entry point (could be hit directly).
  if (!(await canAccessCoursework(leader, courseworkId))) {
    return { error: "You are not authorized to submit for this coursework." };
  }

  const group = await prisma.group.findUnique({
    where: { leaderId: leader.id },
  });
  if (!group) {
    return { error: "You are not assigned to a group." };
  }

  const coursework = await prisma.coursework.findUnique({
    where: { id: courseworkId },
  });
  if (!coursework) {
    return { error: "Coursework not found." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  if (!isAllowedSubmissionMimeType(file.type)) {
    return {
      error: "Unsupported file type. Upload a PDF or Word (.docx) document.",
    };
  }

  if (file.size > MAX_SUBMISSION_SIZE_BYTES) {
    return { error: "Maximum file size exceeded." };
  }

  const isLate = Date.now() > coursework.deadline.getTime();
  if (isLate && !coursework.allowLateSubmission) {
    return { error: "The coursework deadline has passed." };
  }

  const lastVersion = await prisma.submission.aggregate({
    where: { courseworkId, groupId: group.id },
    _max: { version: true },
  });
  const version = (lastVersion._max.version ?? 0) + 1;

  const path = buildSubmissionPath({
    courseId: coursework.courseId,
    courseworkId,
    groupId: group.id,
    version,
    mimeType: file.type,
  });

  try {
    await uploadSubmissionFile(path, file);
  } catch {
    return { error: "Upload failed. Please try again." };
  }

  const status = isLate ? "LATE" : "SUBMITTED";

  try {
    await prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          courseworkId,
          groupId: group.id,
          fileName: file.name,
          filePath: path,
          fileSize: file.size,
          mimeType: file.type,
          version,
          status,
        },
      });
      await recordAudit(tx, {
        userId: leader.id,
        action: "SUBMIT_WORK",
        resourceType: "Submission",
        resourceId: submission.id,
        metadata: { version, status },
      });
    });
  } catch {
    // The DB write failed after the file landed in storage -- don't leave
    // an orphaned object with no Submission row pointing at it.
    await deleteSubmissionFile(path);
    return { error: "Unable to save the submission. Please try again." };
  }

  revalidatePath(`/leader/coursework/${courseworkId}`);
  revalidatePath("/leader/coursework");
  return { ok: true };
}
