"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/auth/admin-client";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import { createGroupSchema, updateGroupSchema } from "@/lib/validation/group";

const UNIQUE_CONSTRAINT_ERROR = "P2002";

export type CreateGroupState = {
  error?: string;
  success?: { leaderEmail: string; password: string };
};

export async function createGroup(
  _prevState: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const admin = await requireRole("ADMIN");

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    courseId: formData.get("courseId"),
    leaderName: formData.get("leaderName"),
    leaderEmail: formData.get("leaderEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
  });
  if (!course) {
    return { error: "Select a valid course." };
  }

  const supabaseAdmin = createAdminClient();
  const password = randomBytes(9).toString("base64url");

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.leaderEmail,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return {
      error:
        error?.code === "email_exists"
          ? "A user with this email already exists."
          : "Unable to create the group leader account.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const leader = await tx.user.create({
        data: {
          id: data.user.id,
          name: parsed.data.leaderName,
          email: parsed.data.leaderEmail,
          role: "GROUP_LEADER",
          active: true,
        },
      });
      const group = await tx.group.create({
        data: {
          name: parsed.data.name,
          courseId: parsed.data.courseId,
          leaderId: leader.id,
        },
      });
      await recordAudit(tx, {
        userId: admin.id,
        action: "CREATE_GROUP",
        resourceType: "Group",
        resourceId: group.id,
      });
      await recordAudit(tx, {
        userId: admin.id,
        action: "ASSIGN_GROUP_LEADER",
        resourceType: "Group",
        resourceId: group.id,
        metadata: { leaderId: leader.id },
      });
    });
  } catch {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return { error: "Unable to create the group. Please try again." };
  }

  revalidatePath("/admin/groups");
  return { success: { leaderEmail: parsed.data.leaderEmail, password } };
}

export type UpdateGroupState = { error?: string; ok?: boolean };

export async function updateGroup(
  _prevState: UpdateGroupState,
  formData: FormData
): Promise<UpdateGroupState> {
  const admin = await requireRole("ADMIN");

  const parsed = updateGroupSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    courseId: formData.get("courseId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.group.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing) {
    return { error: "Group not found." };
  }

  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
  });
  if (!course) {
    return { error: "Select a valid course." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.group.update({
        where: { id: parsed.data.id },
        data: { name: parsed.data.name, courseId: parsed.data.courseId },
      });
      await recordAudit(tx, {
        userId: admin.id,
        action: "UPDATE_GROUP",
        resourceType: "Group",
        resourceId: parsed.data.id,
        metadata: {
          before: { name: existing.name, courseId: existing.courseId },
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
      return { error: "Unable to update the group." };
    }
    return { error: "Unable to update the group. Please try again." };
  }

  revalidatePath("/admin/groups");
  return { ok: true };
}
