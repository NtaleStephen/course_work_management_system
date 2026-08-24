import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { CreateGroupDialog } from "@/components/admin/create-group-dialog";
import { GroupsTable } from "@/components/admin/groups-table";

export default async function GroupsPage() {
  await requireRole("ADMIN");

  const [groups, courses] = await Promise.all([
    prisma.group.findMany({
      include: { course: true, leader: true, _count: { select: { members: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Groups</h1>
          <p className="text-sm text-muted-foreground">
            Manage groups, their course, and group leader.
          </p>
        </div>
        <CreateGroupDialog courses={courses} />
      </div>
      <GroupsTable groups={groups} courses={courses} />
    </div>
  );
}
