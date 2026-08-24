import { prisma } from "@/lib/db/client";
import type { Prisma } from "@/lib/generated/prisma/client";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

// Not exhaustive -- extend as new mutations need logging. Kept as a plain
// string union rather than a DB enum so adding an action never needs a
// migration.
export const AUDIT_ACTIONS = [
  "LOGIN",
  "CREATE_LECTURER",
  "UPDATE_LECTURER",
  "CREATE_COURSE",
  "UPDATE_COURSE",
  "CREATE_GROUP",
  "UPDATE_GROUP",
  "ASSIGN_GROUP_LEADER",
  "CREATE_GROUP_MEMBER",
  "UPDATE_GROUP_MEMBER",
  "REMOVE_GROUP_MEMBER",
  "CREATE_COURSEWORK",
  "UPDATE_COURSEWORK",
  "PUBLISH_COURSEWORK",
  "SUBMIT_WORK",
  "UPDATE_SUBMISSION",
  "AWARD_MARK",
  "UPDATE_MARK",
  "PUBLISH_RESULT",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// Pass `tx` (from prisma.$transaction) when the audit record must succeed or
// fail atomically with the mutation it's logging -- marks and membership
// changes especially (business-logic.md §29). Pass the plain `prisma` client
// for anything else, e.g. LOGIN.
export async function recordAudit(
  client: PrismaClientOrTx,
  params: {
    userId: string;
    action: AuditAction;
    resourceType: string;
    resourceId: string;
    metadata?: Prisma.InputJsonValue;
  }
): Promise<void> {
  await client.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata,
    },
  });
}
