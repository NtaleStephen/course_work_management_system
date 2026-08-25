import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { canAccessCoursework } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { deriveSubmissionStatus } from "@/lib/submission-status";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import { UploadSubmissionForm } from "@/components/leader/upload-submission-form";

export default async function LeaderCourseworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("GROUP_LEADER");
  const { id } = await params;

  const coursework = await prisma.coursework.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!coursework || !(await canAccessCoursework(user, id))) {
    notFound();
  }

  const group = await prisma.group.findUnique({ where: { leaderId: user.id } });
  const latestSubmission = group
    ? await prisma.submission.findFirst({
        where: { courseworkId: id, groupId: group.id },
        include: { mark: true },
        orderBy: { version: "desc" },
      })
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {coursework.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {coursework.course.name}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4 text-sm">
        <p className="text-muted-foreground">Deadline</p>
        <p className="font-medium text-foreground">
          {format(coursework.deadline, "d MMM yyyy, HH:mm")}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Instructions
        </h2>
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {coursework.instructions}
        </p>
      </div>

      {latestSubmission ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-4 text-sm">
            <div>
              <p className="font-medium text-foreground">
                {latestSubmission.fileName}
              </p>
              <p className="text-muted-foreground">
                Submitted{" "}
                {format(latestSubmission.submittedAt, "d MMM yyyy, HH:mm")}
              </p>
            </div>
            <SubmissionStatusBadge
              status={deriveSubmissionStatus({
                submission: {
                  status: latestSubmission.status,
                  mark: latestSubmission.mark
                    ? { status: latestSubmission.mark.status }
                    : null,
                },
              })}
            />
          </div>
          <h2 className="text-sm font-medium text-muted-foreground">
            Replace Submission
          </h2>
          <UploadSubmissionForm courseworkId={coursework.id} />
        </div>
      ) : (
        <UploadSubmissionForm courseworkId={coursework.id} />
      )}
    </div>
  );
}
