import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { CreateLecturerDialog } from "@/components/admin/create-lecturer-dialog";
import { LecturersTable } from "@/components/admin/lecturers-table";

export default async function LecturersPage() {
  await requireRole("ADMIN");

  const lecturers = await prisma.user.findMany({
    where: { role: "LECTURER" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Lecturers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage lecturer accounts.
          </p>
        </div>
        <CreateLecturerDialog />
      </div>
      <LecturersTable lecturers={lecturers} />
    </div>
  );
}
