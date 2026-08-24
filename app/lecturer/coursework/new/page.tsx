import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { CourseworkForm } from "@/components/lecturer/coursework-form";

export default async function NewCourseworkPage() {
  const user = await requireRole("LECTURER");

  const [courses, groups] = await Promise.all([
    prisma.course.findMany({
      where: { lecturerId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.group.findMany({
      where: { course: { lecturerId: user.id } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Create Coursework
        </h1>
        <p className="text-sm text-muted-foreground">
          Assign coursework to selected groups.
        </p>
      </div>
      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You need at least one course before creating coursework.
        </p>
      ) : (
        <CourseworkForm courses={courses} groups={groups} />
      )}
    </div>
  );
}
