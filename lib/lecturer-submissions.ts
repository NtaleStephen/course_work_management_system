import { prisma } from "@/lib/db/client";
import { deriveSubmissionStatus, type DerivedSubmissionStatus } from "@/lib/submission-status";

export type LecturerSubmissionRow = {
  courseworkId: string;
  courseworkTitle: string;
  courseworkDeadline: Date;
  courseName: string;
  groupId: string;
  groupName: string;
  status: DerivedSubmissionStatus;
  submission: {
    id: string;
    submittedAt: Date;
    mark: { awarded: number; maxMarks: number; publishedAt: Date | null } | null;
  } | null;
};

// The "latest submission per group per coursework" flattening used by the
// submissions overview, marking queue, results log, and dashboard -- one
// query shape, sliced differently per page instead of re-derived four times.
export async function getLecturerSubmissionRows(
  lecturerId: string
): Promise<LecturerSubmissionRow[]> {
  const coursework = await prisma.coursework.findMany({
    where: { lecturerId, status: "PUBLISHED" },
    include: {
      course: true,
      assignedGroups: { include: { group: true } },
      submissions: { include: { mark: true }, orderBy: { version: "desc" } },
    },
    orderBy: { deadline: "desc" },
  });

  return coursework.flatMap((cw) => {
    const latestByGroup = new Map<string, (typeof cw.submissions)[number]>();
    for (const submission of cw.submissions) {
      if (!latestByGroup.has(submission.groupId)) {
        latestByGroup.set(submission.groupId, submission);
      }
    }

    return cw.assignedGroups.map((assignment) => {
      const latest = latestByGroup.get(assignment.groupId);
      const submission = latest
        ? {
            status: latest.status,
            mark: latest.mark ? { status: latest.mark.status } : null,
          }
        : null;

      return {
        courseworkId: cw.id,
        courseworkTitle: cw.title,
        courseworkDeadline: cw.deadline,
        courseName: cw.course.name,
        groupId: assignment.groupId,
        groupName: assignment.group.name,
        status: deriveSubmissionStatus({ submission }),
        submission: latest
          ? {
              id: latest.id,
              submittedAt: latest.submittedAt,
              mark: latest.mark
                ? {
                    awarded: latest.mark.awarded,
                    maxMarks: latest.mark.maxMarks,
                    publishedAt: latest.mark.publishedAt,
                  }
                : null,
            }
          : null,
      };
    });
  });
}
