"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import { courseworkSchema } from "@/lib/validation/coursework";

export type CourseworkFormState = { error?: string };

function parseCourseworkForm(formData: FormData) {
  return courseworkSchema.safeParse({
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    maxMarks: formData.get("maxMarks"),
    deadline: formData.get("deadline"),
    courseId: formData.get("courseId"),
    allowLateSubmission: formData.get("allowLateSubmission") === "on",
    groupIds: formData.getAll("groupIds"),
  });
}

// Shared ownership check: the course must belong to the calling lecturer,
// and every selected group must belong to that same course (business-logic.md
// §4 -- a lecturer only manages their own courses/groups).
async function assertOwnedCourseAndGroups(
  lecturerId: string,
  courseId: string,
  groupIds: string[]
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.lecturerId !== lecturerId) {
    return "Select a valid course.";
  }

  const matchingGroups = await prisma.group.count({
    where: { id: { in: groupIds }, courseId },
  });
  if (matchingGroups !== groupIds.length) {
    return "One or more selected groups are invalid for this course.";
  }

  return null;
}

export async function createCoursework(
  _prevState: CourseworkFormState,
  formData: FormData
): Promise<CourseworkFormState> {
  const lecturer = await requireRole("LECTURER");

  const parsed = parseCourseworkForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const ownershipError = await assertOwnedCourseAndGroups(
    lecturer.id,
    parsed.data.courseId,
    parsed.data.groupIds
  );
  if (ownershipError) {
    return { error: ownershipError };
  }

  const intent = formData.get("intent");
  const publishing = intent === "publish";

  let courseworkId: string;
  try {
    courseworkId = await prisma.$transaction(async (tx) => {
      const coursework = await tx.coursework.create({
        data: {
          title: parsed.data.title,
          instructions: parsed.data.instructions,
          maxMarks: parsed.data.maxMarks,
          deadline: parsed.data.deadline,
          allowLateSubmission: parsed.data.allowLateSubmission,
          courseId: parsed.data.courseId,
          lecturerId: lecturer.id,
          status: publishing ? "PUBLISHED" : "DRAFT",
          publishedAt: publishing ? new Date() : null,
        },
      });

      await tx.courseworkGroup.createMany({
        data: parsed.data.groupIds.map((groupId) => ({
          courseworkId: coursework.id,
          groupId,
        })),
      });

      await recordAudit(tx, {
        userId: lecturer.id,
        action: "CREATE_COURSEWORK",
        resourceType: "Coursework",
        resourceId: coursework.id,
      });

      if (publishing) {
        await recordAudit(tx, {
          userId: lecturer.id,
          action: "PUBLISH_COURSEWORK",
          resourceType: "Coursework",
          resourceId: coursework.id,
        });
      }

      return coursework.id;
    });
  } catch {
    return { error: "Unable to create the coursework. Please try again." };
  }

  revalidatePath("/lecturer/coursework");
  redirect(`/lecturer/coursework/${courseworkId}`);
}

export async function updateCoursework(
  _prevState: CourseworkFormState,
  formData: FormData
): Promise<CourseworkFormState> {
  const lecturer = await requireRole("LECTURER");

  const id = formData.get("id");
  if (typeof id !== "string") {
    return { error: "Invalid request." };
  }

  const existing = await prisma.coursework.findUnique({ where: { id } });
  if (!existing || existing.lecturerId !== lecturer.id) {
    return { error: "Coursework not found." };
  }
  // business-logic.md §4: only unpublished coursework can be edited.
  if (existing.status !== "DRAFT") {
    return { error: "Published coursework can no longer be edited." };
  }

  const parsed = parseCourseworkForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const ownershipError = await assertOwnedCourseAndGroups(
    lecturer.id,
    parsed.data.courseId,
    parsed.data.groupIds
  );
  if (ownershipError) {
    return { error: ownershipError };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.coursework.update({
        where: { id },
        data: {
          title: parsed.data.title,
          instructions: parsed.data.instructions,
          maxMarks: parsed.data.maxMarks,
          deadline: parsed.data.deadline,
          allowLateSubmission: parsed.data.allowLateSubmission,
          courseId: parsed.data.courseId,
        },
      });

      await tx.courseworkGroup.deleteMany({ where: { courseworkId: id } });
      await tx.courseworkGroup.createMany({
        data: parsed.data.groupIds.map((groupId) => ({
          courseworkId: id,
          groupId,
        })),
      });

      await recordAudit(tx, {
        userId: lecturer.id,
        action: "UPDATE_COURSEWORK",
        resourceType: "Coursework",
        resourceId: id,
      });
    });
  } catch {
    return { error: "Unable to update the coursework. Please try again." };
  }

  revalidatePath("/lecturer/coursework");
  revalidatePath(`/lecturer/coursework/${id}`);
  redirect(`/lecturer/coursework/${id}`);
}

export type PublishState = { error?: string; ok?: boolean };

export async function publishCoursework(
  _prevState: PublishState,
  formData: FormData
): Promise<PublishState> {
  const lecturer = await requireRole("LECTURER");

  const id = formData.get("id");
  if (typeof id !== "string") {
    return { error: "Invalid request." };
  }

  const existing = await prisma.coursework.findUnique({ where: { id } });
  if (!existing || existing.lecturerId !== lecturer.id) {
    return { error: "Coursework not found." };
  }
  if (existing.status === "PUBLISHED") {
    return { error: "This coursework is already published." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.coursework.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    await recordAudit(tx, {
      userId: lecturer.id,
      action: "PUBLISH_COURSEWORK",
      resourceType: "Coursework",
      resourceId: id,
    });
  });

  revalidatePath(`/lecturer/coursework/${id}`);
  revalidatePath("/lecturer/coursework");
  return { ok: true };
}
