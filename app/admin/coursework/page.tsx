import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import {
  AllCourseworkTable,
  type AdminCourseworkRow,
} from "@/components/admin/all-coursework-table";

// Admin can view all coursework system-wide (business-logic.md §3.1) but
// doesn't create or manage it -- that stays the owning lecturer's job.
export default async function AdminCourseworkPage() {
  await requireRole("ADMIN");

  const coursework = await prisma.coursework.findMany({
    include: { course: true, lecturer: true },
    orderBy: { deadline: "desc" },
  });

  const rows: AdminCourseworkRow[] = coursework.map((cw) => ({
    id: cw.id,
    title: cw.title,
    courseName: cw.course.name,
    lecturerName: cw.lecturer.name,
    deadline: cw.deadline,
    status: cw.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Coursework
        </h1>
        <p className="text-sm text-muted-foreground">
          All coursework across every course and lecturer.
        </p>
      </div>
      <AllCourseworkTable items={rows} />
    </div>
  );
}
