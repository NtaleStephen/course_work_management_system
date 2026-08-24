import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [
    lecturerCount,
    groupLeaderCount,
    groupCount,
    courseCount,
    courseworkCount,
    submissionCount,
    activeUserCount,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "LECTURER" } }),
    prisma.user.count({ where: { role: "GROUP_LEADER" } }),
    prisma.group.count(),
    prisma.course.count(),
    prisma.coursework.count(),
    prisma.submission.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          System overview and class structure.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Users</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Lecturers" value={lecturerCount} />
          <StatCard label="Group Leaders" value={groupLeaderCount} />
          <StatCard label="Groups" value={groupCount} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Academic
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Courses" value={courseCount} />
          <StatCard label="Coursework" value={courseworkCount} />
          <StatCard label="Submissions" value={submissionCount} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">System</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Active Users" value={activeUserCount} />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentActivity.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-foreground">
                        {log.user.name} {formatAction(log.action)}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(log.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/audit-logs" />}>
          View Audit Logs
        </Button>
      </section>
    </div>
  );
}
