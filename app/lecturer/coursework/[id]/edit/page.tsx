import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { CourseworkForm } from "@/components/lecturer/coursework-form";

export default async function EditCourseworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("LECTURER");
  const { id } = await params;

  const coursework = await prisma.coursework.findUnique({
    where: { id },
    include: { assignedGroups: true },
  });

  if (!coursework || coursework.lecturerId !== user.id) {
    notFound();
  }

  // business-logic.md §4: only unpublished coursework can be edited.
  if (coursework.status !== "DRAFT") {
    redirect(`/lecturer/coursework/${id}`);
  }

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
          Edit Coursework
        </h1>
      </div>
      <CourseworkForm
        courses={courses}
        groups={groups}
        coursework={coursework}
        assignedGroupIds={coursework.assignedGroups.map((g) => g.groupId)}
      />
    </div>
  );
}
