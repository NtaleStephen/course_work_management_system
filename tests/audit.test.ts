import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";

describe("recordAudit", () => {
  const userId = randomUUID();

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("writes a row with the given fields", async () => {
    await prisma.user.create({
      data: {
        id: userId,
        email: `audit-${randomUUID()}@test.local`,
        name: "Audit Test User",
        role: "ADMIN",
      },
    });

    await recordAudit(prisma, {
      userId,
      action: "LOGIN",
      resourceType: "User",
      resourceId: userId,
      metadata: { note: "test" },
    });

    const rows = await prisma.auditLog.findMany({ where: { userId } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      userId,
      action: "LOGIN",
      resourceType: "User",
      resourceId: userId,
      metadata: { note: "test" },
    });
  });

  it("participates in a transaction and rolls back with it", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await recordAudit(tx, {
          userId,
          action: "LOGIN",
          resourceType: "User",
          resourceId: userId,
        });
        throw new Error("force rollback");
      })
    ).rejects.toThrow("force rollback");

    const rows = await prisma.auditLog.findMany({
      where: { userId, action: "LOGIN" },
    });
    // the successful write from the first test still exists; the aborted
    // transaction's write must not have landed
    expect(rows).toHaveLength(1);
  });
});
