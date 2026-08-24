import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { UsersTable } from "@/components/admin/users-table";

export default async function UsersPage() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          Everyone with a system account, across all roles.
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
