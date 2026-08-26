import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import {
  LecturerGroupsTable,
  type LecturerGroupRow,
} from "@/components/lecturer/groups-table";

// business-logic.md §4: lecturer can "view groups belonging to their
// courses" -- read-only, scoped to their own courses. Creating groups and
// assigning leaders stays admin-only.
export default async function LecturerGroupsPage() {
  const user = await requireRole("LECTURER");

  const groups = await prisma.group.findMany({
    where: { course: { lecturerId: user.id } },
    include: { course: true, leader: true, _count: { select: { members: true } } },
    orderBy: { name: "asc" },
  });

  const rows: LecturerGroupRow[] = groups.map((group) => ({
    id: group.id,
    name: group.name,
    courseName: group.course.name,
    leaderName: group.leader.name,
    memberCount: group._count.members,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Groups</h1>
        <p className="text-sm text-muted-foreground">
          Groups belonging to your courses.
        </p>
      </div>
      <LecturerGroupsTable groups={rows} />
    </div>
  );
}
