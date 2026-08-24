"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { canMarkSubmission } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import { saveMarkSchema } from "@/lib/validation/mark";

export type MarkActionState = { error?: string; ok?: boolean };

function revalidateMarkingPaths(courseworkId: string, submissionId: string) {
  revalidatePath(`/marking/${submissionId}`);
  revalidatePath(`/lecturer/coursework/${courseworkId}`);
  revalidatePath("/lecturer/marking");
  revalidatePath("/lecturer/submissions");
}

export async function saveMark(
  _prevState: MarkActionState,
  formData: FormData
): Promise<MarkActionState> {
  const lecturer = await requireRole("LECTURER");

  const parsed = saveMarkSchema.safeParse({
    submissionId: formData.get("submissionId"),
    awarded: formData.get("awarded"),
    feedback: formData.get("feedback"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { submissionId, awarded, feedback } = parsed.data;

  if (!(await canMarkSubmission(lecturer, submissionId))) {
    return { error: "You are not authorized to mark this submission." };
  }

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { coursework: true, mark: true },
  });

  if (awarded > submission.coursework.maxMarks) {
    return {
      error: `Mark cannot exceed the maximum of ${submission.coursework.maxMarks}.`,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (submission.mark) {
        await tx.mark.update({
          where: { submissionId },
          data: { awarded, feedback: feedback || null },
        });
        await recordAudit(tx, {
          userId: lecturer.id,
          action: "UPDATE_MARK",
          resourceType: "Mark",
          resourceId: submission.mark!.id,
          metadata: { submissionId, awarded },
        });
      } else {
        const mark = await tx.mark.create({
          data: {
            submissionId,
            awarded,
            maxMarks: submission.coursework.maxMarks,
            feedback: feedback || null,
          },
        });
        await recordAudit(tx, {
          userId: lecturer.id,
          action: "AWARD_MARK",
          resourceType: "Mark",
          resourceId: mark.id,
          metadata: { submissionId, awarded },
        });
      }
    });
  } catch {
    return { error: "Unable to save the mark. Please try again." };
  }

  revalidateMarkingPaths(submission.courseworkId, submissionId);
  return { ok: true };
}

export async function publishResult(
  _prevState: MarkActionState,
  formData: FormData
): Promise<MarkActionState> {
  const lecturer = await requireRole("LECTURER");

  const submissionId = formData.get("submissionId");
  if (typeof submissionId !== "string") {
    return { error: "Invalid request." };
  }

  if (!(await canMarkSubmission(lecturer, submissionId))) {
    return { error: "You are not authorized to publish this result." };
  }

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { mark: true },
  });

  if (!submission.mark) {
    return { error: "Save a mark before publishing." };
  }
  if (submission.mark.status === "PUBLISHED") {
    return { error: "This result has already been published." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.mark.update({
      where: { submissionId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    await recordAudit(tx, {
      userId: lecturer.id,
      action: "PUBLISH_RESULT",
      resourceType: "Mark",
      resourceId: submission.mark!.id,
      metadata: { submissionId },
    });
  });

  revalidateMarkingPaths(submission.courseworkId, submissionId);
  return { ok: true };
}
