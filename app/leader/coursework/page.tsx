import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { CourseworkCard } from "@/components/leader/coursework-card";

export default async function LeaderCourseworkPage() {
  const user = await requireRole("GROUP_LEADER");

  const group = await prisma.group.findUnique({ where: { leaderId: user.id } });

  if (!group) {
    return (
      <p className="text-sm text-muted-foreground">
        You are not currently assigned to lead a group.
      </p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Coursework
        </h1>
        <p className="text-sm text-muted-foreground">
          Coursework assigned to {group.name}.
        </p>
      </div>

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
  );
}
