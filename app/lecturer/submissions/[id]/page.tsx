import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { canMarkSubmission } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { createSubmissionSignedUrl } from "@/lib/storage/signed-url";
import { deriveSubmissionStatus } from "@/lib/submission-status";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import { SubmissionDocumentViewer } from "@/components/lecturer/submission-document-viewer";

export default async function SubmissionViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("LECTURER");
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { coursework: true, group: true, mark: true },
  });

  // canMarkSubmission is the exact ownership check needed here too --
  // viewing a submission requires the same "lecturer owns this coursework"
  // authorization as marking it (business-logic.md §28).
  if (!submission || !(await canMarkSubmission(user, id))) {
    notFound();
  }

  const signedUrl = await createSubmissionSignedUrl(submission.filePath);
  const status = deriveSubmissionStatus({
    submission: {
      status: submission.status,
      mark: submission.mark ? { status: submission.mark.status } : null,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {submission.group.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {submission.coursework.title} &middot; {submission.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            Submitted {format(submission.submittedAt, "d MMM yyyy, HH:mm")}
          </p>
        </div>
        <SubmissionStatusBadge status={status} />
      </div>

      <SubmissionDocumentViewer url={signedUrl} mimeType={submission.mimeType} />
    </div>
  );
}
