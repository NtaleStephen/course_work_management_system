import Link from "next/link";
import { format } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { getLecturerSubmissionRows } from "@/lib/lecturer-submissions";
import { getDeadlineUrgency } from "@/lib/deadline-urgency";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeadlineBadge } from "@/components/shared/deadline-badge";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function LecturerDashboardPage() {
  const user = await requireRole("LECTURER");

  const rows = await getLecturerSubmissionRows(user.id);

  const submitted = rows.filter(
    (r) => r.status === "SUBMITTED" || r.status === "LATE"
  ).length;
  const awaitingMarking = rows.filter((r) => r.status === "MARKED").length;
  const notSubmitted = rows.filter(
    (r) => r.status === "NOT_SUBMITTED"
  ).length;

  const byCoursework = new Map<
    string,
    {
      title: string;
      courseName: string;
      deadline: Date;
      total: number;
      submittedCount: number;
    }
  >();
  for (const row of rows) {
    const entry = byCoursework.get(row.courseworkId) ?? {
      title: row.courseworkTitle,
      courseName: row.courseName,
      deadline: row.courseworkDeadline,
      total: 0,
      submittedCount: 0,
    };
    entry.total += 1;
    if (row.submission) entry.submittedCount += 1;
    byCoursework.set(row.courseworkId, entry);
  }

  const activeCoursework = [...byCoursework.entries()]
    .filter(([, cw]) => getDeadlineUrgency(cw.deadline) !== "late")
    .sort((a, b) => a[1].deadline.getTime() - b[1].deadline.getTime());

  const recentSubmissions = rows
    .filter((r) => r.submission)
    .sort(
      (a, b) => b.submission!.submittedAt.getTime() - a.submission!.submittedAt.getTime()
    )
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {greeting()}, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your coursework.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active Coursework" value={activeCoursework.length} />
        <StatCard label="Submitted" value={submitted} />
        <StatCard label="Awaiting Marking" value={awaitingMarking} />
        <StatCard label="Not Submitted" value={notSubmitted} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Active Coursework
        </h2>
        {activeCoursework.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No active coursework right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCoursework.map(([courseworkId, cw]) => (
              <Card key={courseworkId}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {cw.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cw.courseName}
                      </p>
                    </div>
                    <DeadlineBadge deadline={cw.deadline} />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${cw.total === 0 ? 0 : Math.round((cw.submittedCount / cw.total) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cw.submittedCount} / {cw.total} groups submitted
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    render={
                      <Link href={`/lecturer/coursework/${courseworkId}`} />
                    }
                  >
                    View Coursework
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Recent Submissions
        </h2>
        {recentSubmissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No submissions yet.
          </p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Coursework</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((row) => (
                  <TableRow key={`${row.courseworkId}-${row.groupId}`}>
                    <TableCell className="font-medium">
                      {row.groupName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.courseworkTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(row.submission!.submittedAt, "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <SubmissionStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
