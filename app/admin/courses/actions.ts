"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import { createCourseSchema, updateCourseSchema } from "@/lib/validation/course";

const UNIQUE_CONSTRAINT_ERROR = "P2002";

export type CreateCourseState = { error?: string; ok?: boolean };

export async function createCourse(
  _prevState: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState> {
  const admin = await requireRole("ADMIN");

  const parsed = createCourseSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    lecturerId: formData.get("lecturerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const lecturer = await prisma.user.findUnique({
    where: { id: parsed.data.lecturerId },
  });
  if (!lecturer || lecturer.role !== "LECTURER") {
    return { error: "Select a valid lecturer." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({ data: parsed.data });
      await recordAudit(tx, {
        userId: admin.id,
        action: "CREATE_COURSE",
        resourceType: "Course",
        resourceId: course.id,
      });
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { error: "A course with this code already exists." };
    }
    return { error: "Unable to create the course. Please try again." };
  }

  revalidatePath("/admin/courses");
  return { ok: true };
}

export type UpdateCourseState = { error?: string; ok?: boolean };

export async function updateCourse(
  _prevState: UpdateCourseState,
  formData: FormData
): Promise<UpdateCourseState> {
  const admin = await requireRole("ADMIN");

  const parsed = updateCourseSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    code: formData.get("code"),
    lecturerId: formData.get("lecturerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.course.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing) {
    return { error: "Course not found." };
  }

  const lecturer = await prisma.user.findUnique({
    where: { id: parsed.data.lecturerId },
  });
  if (!lecturer || lecturer.role !== "LECTURER") {
    return { error: "Select a valid lecturer." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.course.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          code: parsed.data.code,
          lecturerId: parsed.data.lecturerId,
        },
      });
      await recordAudit(tx, {
        userId: admin.id,
        action: "UPDATE_COURSE",
        resourceType: "Course",
        resourceId: parsed.data.id,
        metadata: {
          before: {
            name: existing.name,
            code: existing.code,
            lecturerId: existing.lecturerId,
          },
          after: parsed.data,
        },
      });
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return { error: "A course with this code already exists." };
    }
    return { error: "Unable to update the course. Please try again." };
  }

  revalidatePath("/admin/courses");
  return { ok: true };
}
