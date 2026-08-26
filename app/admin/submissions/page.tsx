import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { deriveSubmissionStatus } from "@/lib/submission-status";
import {
  AdminSubmissionsTable,
  type AdminSubmissionRow,
} from "@/components/admin/all-submissions-table";

// Admin can view all submissions system-wide (business-logic.md §3.1),
// read-only -- marking and publishing stay the owning lecturer's job.
export default async function AdminSubmissionsPage() {
  await requireRole("ADMIN");

  const coursework = await prisma.coursework.findMany({
    where: { status: "PUBLISHED" },
    include: {
      course: true,
      lecturer: true,
      assignedGroups: { include: { group: true } },
      submissions: { include: { mark: true }, orderBy: { version: "desc" } },
    },
    orderBy: { deadline: "desc" },
  });

  const rows: AdminSubmissionRow[] = coursework.flatMap((cw) => {
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
        groupName: assignment.group.name,
        courseworkTitle: cw.title,
        courseName: cw.course.name,
        lecturerName: cw.lecturer.name,
        status: deriveSubmissionStatus({
          submission: latest
            ? {
                status: latest.status,
                mark: latest.mark ? { status: latest.mark.status } : null,
              }
            : null,
        }),
        submittedAt: latest?.submittedAt ?? null,
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
          Every group's submission status across the whole system.
        </p>
      </div>
      <AdminSubmissionsTable rows={rows} />
    </div>
  );
}
