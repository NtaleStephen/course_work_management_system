"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/auth/admin-client";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import {
  createLecturerSchema,
  updateLecturerSchema,
} from "@/lib/validation/lecturer";

export type CreateLecturerState = {
  error?: string;
  success?: { email: string; password: string };
};

export async function createLecturer(
  _prevState: CreateLecturerState,
  formData: FormData
): Promise<CreateLecturerState> {
  const admin = await requireRole("ADMIN");

  const parsed = createLecturerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabaseAdmin = createAdminClient();
  const password = randomBytes(9).toString("base64url");

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return {
      error:
        error?.code === "email_exists"
          ? "A user with this email already exists."
          : "Unable to create the lecturer account.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const lecturer = await tx.user.create({
        data: {
          id: data.user.id,
          name: parsed.data.name,
          email: parsed.data.email,
          role: "LECTURER",
          active: true,
        },
      });
      await recordAudit(tx, {
        userId: admin.id,
        action: "CREATE_LECTURER",
        resourceType: "User",
        resourceId: lecturer.id,
      });
    });
  } catch {
    // Don't leave a Supabase Auth account with no matching app record.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return { error: "Unable to create the lecturer account. Please try again." };
  }

  revalidatePath("/admin/lecturers");
  return { success: { email: parsed.data.email, password } };
}

export type UpdateLecturerState = { error?: string; ok?: boolean };

export async function updateLecturer(
  _prevState: UpdateLecturerState,
  formData: FormData
): Promise<UpdateLecturerState> {
  const admin = await requireRole("ADMIN");

  const parsed = updateLecturerSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing || existing.role !== "LECTURER") {
    return { error: "Lecturer not found." };
  }

  const supabaseAdmin = createAdminClient();

  if (existing.email !== parsed.data.email) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      parsed.data.id,
      { email: parsed.data.email, email_confirm: true }
    );
    if (error) {
      return {
        error:
          error.code === "email_exists"
            ? "A user with this email already exists."
            : "Unable to update the email address.",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name, email: parsed.data.email },
    });
    await recordAudit(tx, {
      userId: admin.id,
      action: "UPDATE_LECTURER",
      resourceType: "User",
      resourceId: parsed.data.id,
      metadata: {
        before: { name: existing.name, email: existing.email },
        after: { name: parsed.data.name, email: parsed.data.email },
      },
    });
  });

  revalidatePath("/admin/lecturers");
  return { ok: true };
}

export async function setLecturerActive(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");

  const id = formData.get("id");
  const active = formData.get("active") === "true";
  if (typeof id !== "string") return;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== "LECTURER") return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { active } });
    await recordAudit(tx, {
      userId: admin.id,
      action: "UPDATE_LECTURER",
      resourceType: "User",
      resourceId: id,
      metadata: { activeChanged: { from: existing.active, to: active } },
    });
  });

  revalidatePath("/admin/lecturers");
}
