import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { AuditLogsTable } from "@/components/admin/audit-logs-table";

const RECENT_LOG_LIMIT = 200;

export default async function AuditLogsPage() {
  await requireRole("ADMIN");

  const logs = await prisma.auditLog.findMany({
    take: RECENT_LOG_LIMIT,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          The most recent {RECENT_LOG_LIMIT} system actions.
        </p>
      </div>
      <AuditLogsTable logs={logs} />
    </div>
  );
}
