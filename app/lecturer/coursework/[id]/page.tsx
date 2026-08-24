import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { canAccessCoursework } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublishCourseworkDialog } from "@/components/lecturer/publish-coursework-dialog";
import {
  SubmissionOverview,
  type GroupSubmissionRow,
} from "@/components/lecturer/submission-overview";

export default async function CourseworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("LECTURER");
  const { id } = await params;

  const coursework = await prisma.coursework.findUnique({
    where: { id },
    include: {
      course: true,
      assignedGroups: { include: { group: true } },
    },
  });

  if (!coursework || !(await canAccessCoursework(user, id))) {
    notFound();
  }

  const isDraft = coursework.status === "DRAFT";

  let submissionRows: GroupSubmissionRow[] = [];
  if (!isDraft) {
    // Not Submitted is never a stored list -- it's assigned groups minus
    // groups that have a submission row (business-logic.md §24).
    const submissions = await prisma.submission.findMany({
      where: { courseworkId: id },
      include: { mark: true },
      orderBy: { version: "desc" },
    });

    const latestByGroup = new Map<string, (typeof submissions)[number]>();
    for (const submission of submissions) {
      if (!latestByGroup.has(submission.groupId)) {
        latestByGroup.set(submission.groupId, submission);
      }
    }

    submissionRows = coursework.assignedGroups.map((assignment) => {
      const latest = latestByGroup.get(assignment.groupId);
      return {
        groupId: assignment.groupId,
        groupName: assignment.group.name,
        submission: latest
          ? {
              id: latest.id,
              status: latest.status,
              submittedAt: latest.submittedAt,
              mark: latest.mark ? { status: latest.mark.status } : null,
            }
          : null,
      };
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {coursework.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {coursework.course.name}
          </p>
        </div>
        {isDraft ? (
          <Badge variant="secondary">Draft</Badge>
        ) : (
          <Badge className="border-green-200 bg-green-50 text-green-700">
            Published
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Deadline</p>
          <p className="font-medium text-foreground">
            {format(coursework.deadline, "d MMM yyyy, HH:mm")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Maximum Marks</p>
          <p className="font-medium text-foreground">{coursework.maxMarks}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Late Submissions</p>
          <p className="font-medium text-foreground">
            {coursework.allowLateSubmission ? "Allowed" : "Not allowed"}
          </p>
        </div>
      </div>

      {isDraft ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href={`/lecturer/coursework/${coursework.id}/edit`} />}
          >
            Edit
          </Button>
          <PublishCourseworkDialog
            courseworkId={coursework.id}
            title={coursework.title}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Instructions
        </h2>
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {coursework.instructions}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {isDraft ? "Groups" : "Submissions"}
        </h2>
        {coursework.assignedGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups assigned.</p>
        ) : isDraft ? (
          <ul className="space-y-1 text-sm text-foreground">
            {coursework.assignedGroups.map((assignment) => (
              <li key={assignment.id}>{assignment.group.name}</li>
            ))}
          </ul>
        ) : (
          <SubmissionOverview rows={submissionRows} />
        )}
      </div>
    </div>
  );
}
