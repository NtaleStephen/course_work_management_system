import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { StatCard } from "@/components/dashboard/stat-card";
import { CourseworkCard } from "@/components/leader/coursework-card";

export default async function LeaderDashboardPage() {
  const user = await requireRole("GROUP_LEADER");

  const group = await prisma.group.findUnique({
    where: { leaderId: user.id },
    include: { course: true, _count: { select: { members: true } } },
  });

  if (!group) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name}.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          You are not currently assigned to lead a group.
        </p>
      </div>
    );
  }

  const assignments = await prisma.courseworkGroup.findMany({
    where: { groupId: group.id, coursework: { status: "PUBLISHED" } },
    include: {
      coursework: {
        include: {
          submissions: {
            where: { groupId: group.id },
            include: { mark: true },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { coursework: { deadline: "asc" } },
  });

  // business-logic.md §26 -- Coursework To Submit / Submitted / Results
  // Available, derived the same way every other submission table is.
  let toSubmit = 0;
  let submitted = 0;
  let resultsAvailable = 0;
  for (const { coursework } of assignments) {
    const submission = coursework.submissions[0];
    if (!submission) {
      toSubmit += 1;
    } else if (submission.mark?.status === "PUBLISHED") {
      resultsAvailable += 1;
    } else {
      submitted += 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name}.
        </p>
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground">{group.name}</p>
        <p className="text-sm text-muted-foreground">
          {group.course.name} &middot; {group._count.members} member
          {group._count.members === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Coursework To Submit" value={toSubmit} />
        <StatCard label="Submitted" value={submitted} />
        <StatCard label="Results Available" value={resultsAvailable} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Coursework
        </h2>
        {assignments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No coursework has been published to your group yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <CourseworkCard
                key={assignment.id}
                coursework={assignment.coursework}
                latestSubmission={assignment.coursework.submissions[0]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
