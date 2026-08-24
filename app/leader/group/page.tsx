import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { AddMemberDialog } from "@/components/leader/add-member-dialog";
import { MembersTable } from "@/components/leader/members-table";

// Parameterless by design -- always resolves to the caller's own group via
// leaderId, so there is no group-id URL to guess (business-logic.md §5).
export default async function MyGroupPage() {
  const leader = await requireRole("GROUP_LEADER");

  const group = await prisma.group.findUnique({
    where: { leaderId: leader.id },
    include: { course: true, members: { orderBy: { name: "asc" } } },
  });

  if (!group) {
    return (
      <p className="text-sm text-muted-foreground">
        You are not currently assigned to lead a group.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {group.name}
        </h1>
        <p className="text-sm text-muted-foreground">{group.course.name}</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Group Leader</p>
        <p className="text-base font-medium text-foreground">
          {leader.name}
        </p>
        <p className="text-sm text-muted-foreground">{leader.email}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Members
          </h2>
          <AddMemberDialog />
        </div>
        <MembersTable members={group.members} />
      </div>
    </div>
  );
}
