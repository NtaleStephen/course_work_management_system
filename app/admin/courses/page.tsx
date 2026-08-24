import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { CreateCourseDialog } from "@/components/admin/create-course-dialog";
import { CoursesTable } from "@/components/admin/courses-table";

export default async function CoursesPage() {
  await requireRole("ADMIN");

  const [courses, lecturers] = await Promise.all([
    prisma.course.findMany({
      include: { lecturer: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "LECTURER", active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage courses and their assigned lecturer.
          </p>
        </div>
        <CreateCourseDialog lecturers={lecturers} />
      </div>
      <CoursesTable courses={courses} lecturers={lecturers} />
    </div>
  );
}
