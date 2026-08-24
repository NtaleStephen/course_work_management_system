import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import {
  AllSubmissionsTable,
  type AllSubmissionsRow,
} from "@/components/lecturer/all-submissions-table";

export default async function LecturerSubmissionsPage() {
  const user = await requireRole("LECTURER");

  const coursework = await prisma.coursework.findMany({
    where: { lecturerId: user.id, status: "PUBLISHED" },
    include: {
      course: true,
      assignedGroups: { include: { group: true } },
      submissions: { orderBy: { version: "desc" } },
    },
    orderBy: { deadline: "desc" },
  });

  const rows: AllSubmissionsRow[] = coursework.flatMap((cw) => {
    const latestByGroup = new Map<string, (typeof cw.submissions)[number]>();
    for (const submission of cw.submissions) {
      if (!latestByGroup.has(submission.groupId)) {
        latestByGroup.set(submission.groupId, submission);
      }
    }

    return cw.assignedGroups.map((assignment) => {
      const latest = latestByGroup.get(assignment.groupId);
      return {
        key: `${cw.id}-${assignment.groupId}`,
        courseworkTitle: cw.title,
        courseName: cw.course.name,
        groupName: assignment.group.name,
        status: latest ? latest.status : "NOT_SUBMITTED",
        submissionId: latest?.id,
      };
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Every group's submission status across your published coursework.
        </p>
      </div>
      <AllSubmissionsTable rows={rows} />
    </div>
  );
}
