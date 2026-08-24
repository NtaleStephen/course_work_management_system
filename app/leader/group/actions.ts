"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import {
  addMemberSchema,
  updateMemberSchema,
} from "@/lib/validation/group-member";

const UNIQUE_CONSTRAINT_ERROR = "P2002";

// Never trust a client-submitted groupId -- always resolve "my own group"
// server-side from the authenticated leader (business-logic.md §5: a leader
// cannot access another group).
async function getOwnGroup(leaderId: string) {
  return prisma.group.findUnique({ where: { leaderId } });
}

export type AddMemberState = { error?: string; ok?: boolean };

export async function addMember(
  _prevState: AddMemberState,
  formData: FormData
): Promise<AddMemberState> {
  const leader = await requireRole("GROUP_LEADER");

  const parsed = addMemberSchema.safeParse({
    name: formData.get("name"),
    registrationNumber: formData.get("registrationNumber"),
    course: formData.get("course"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const group = await getOwnGroup(leader.id);
  if (!group) {
    return { error: "You are not assigned to a group." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const member = await tx.groupMember.create({
        data: { ...parsed.data, groupId: group.id },
      });
      await recordAudit(tx, {
        userId: leader.id,
        action: "CREATE_GROUP_MEMBER",
        resourceType: "GroupMember",
        resourceId: member.id,
      });
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === UNIQUE_CONSTRAINT_ERROR
    ) {
      return {
        error: "A member with this registration number already exists.",
      };
    }
    return { error: "Unable to add the member. Please try again." };
  }

  revalidatePath("/leader/group");
  return { ok: true };
}

export type UpdateMemberState = { error?: string; ok?: boolean };

export async function updateMember(
  _prevState: UpdateMemberState,
  formData: FormData
): Promise<UpdateMemberState> {
  const leader = await requireRole("GROUP_LEADER");

  const parsed = updateMemberSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    registrationNumber: formData.get("registrationNumber"),
    course: formData.get("course"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.groupMember.findUnique({
    where: { id: parsed.data.id },
    include: { group: true },
  });
  if (!existing || existing.group.leaderId !== leader.id) {
    return { error: "Member not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.groupMember.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          registrationNumber: parsed.data.registrationNumber,
          course: parsed.data.course,
        },
      });
      await recordAudit(tx, {
        userId: leader.id,
        action: "UPDATE_GROUP_MEMBER",
        resourceType: "GroupMember",
        resourceId: parsed.data.id,
        metadata: {
          before: {
            name: existing.name,
            registrationNumber: existing.registrationNumber,
            course: existing.course,
          },
          after: {
            name: parsed.data.name,
            registrationNumber: parsed.data.registrationNumber,
            course: parsed.data.course,
          },
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
      return {
        error: "A member with this registration number already exists.",
      };
    }
    return { error: "Unable to update the member. Please try again." };
  }

  revalidatePath("/leader/group");
  return { ok: true };
}

export type RemoveMemberState = { error?: string; ok?: boolean };

export async function removeMember(
  _prevState: RemoveMemberState,
  formData: FormData
): Promise<RemoveMemberState> {
  const leader = await requireRole("GROUP_LEADER");

  const id = formData.get("id");
  if (typeof id !== "string") {
    return { error: "Invalid request." };
  }

  const existing = await prisma.groupMember.findUnique({
    where: { id },
    include: { group: true },
  });
  if (!existing || existing.group.leaderId !== leader.id) {
    return { error: "Member not found." };
  }

  // business-logic.md §7: unrestricted deletion is not allowed once the
  // group has submitted coursework.
  const submissionCount = await prisma.submission.count({
    where: { groupId: existing.groupId },
  });
  if (submissionCount > 0) {
    return {
      error:
        "Members cannot be removed after the group has submitted coursework.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.groupMember.delete({ where: { id } });
    await recordAudit(tx, {
      userId: leader.id,
      action: "REMOVE_GROUP_MEMBER",
      resourceType: "GroupMember",
      resourceId: id,
      metadata: {
        name: existing.name,
        registrationNumber: existing.registrationNumber,
      },
    });
  });

  revalidatePath("/leader/group");
  return { ok: true };
}
