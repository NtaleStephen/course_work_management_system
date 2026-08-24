import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import {
  AllSubmissionsTable,
  type AllSubmissionsRow,
} from "@/components/lecturer/all-submissions-table";
import { deriveSubmissionStatus } from "@/lib/submission-status";

export default async function LecturerMarkingQueuePage() {
  const user = await requireRole("LECTURER");

  const coursework = await prisma.coursework.findMany({
    where: { lecturerId: user.id, status: "PUBLISHED" },
    include: {
      course: true,
      assignedGroups: { include: { group: true } },
      submissions: { include: { mark: true }, orderBy: { version: "desc" } },
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

    return cw.assignedGroups.flatMap((assignment) => {
      const latest = latestByGroup.get(assignment.groupId);
      if (!latest) return [];

      const status = deriveSubmissionStatus({
        submission: {
          status: latest.status,
          mark: latest.mark ? { status: latest.mark.status } : null,
        },
      });
      // The queue is "who still needs marking attention" (design.md §67
      // Priority 2) -- published results have nothing left to do.
      if (status === "RESULT_PUBLISHED") return [];

      return [
        {
          key: `${cw.id}-${assignment.groupId}`,
          courseworkTitle: cw.title,
          courseName: cw.course.name,
          groupName: assignment.group.name,
          status,
          submissionId: latest.id,
        },
      ];
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Marking</h1>
        <p className="text-sm text-muted-foreground">
          Submissions still awaiting a mark or a published result.
        </p>
      </div>
      <AllSubmissionsTable
        rows={rows}
        emptyMessage="Nothing needs marking right now."
      />
    </div>
  );
}
