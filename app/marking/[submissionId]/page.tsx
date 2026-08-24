import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { canMarkSubmission } from "@/lib/permissions";
import { prisma } from "@/lib/db/client";
import { createSubmissionSignedUrl } from "@/lib/storage/signed-url";
import { SubmissionDocumentViewer } from "@/components/lecturer/submission-document-viewer";
import { MarkingPanel } from "@/components/marking/marking-panel";

// Deliberately outside /lecturer's sidebar layout -- the marking workspace
// gets its own minimal chrome so the document stays the primary focus
// (design.md §24).
export default async function MarkingWorkspacePage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const user = await requireRole("LECTURER");
  const { submissionId } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { coursework: true, group: true, mark: true },
  });

  if (!submission || !(await canMarkSubmission(user, submissionId))) {
    notFound();
  }

  const signedUrl = await createSubmissionSignedUrl(submission.filePath);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-4 border-b border-border px-4 py-3">
        <Link
          href={`/lecturer/coursework/${submission.coursework.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {submission.group.name} &middot; {submission.coursework.title}
          </p>
        </div>
        {submission.mark ? (
          <p className="shrink-0 text-sm font-semibold text-foreground">
            {submission.mark.awarded}/{submission.coursework.maxMarks}
          </p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-[7] overflow-hidden border-r border-border">
          <SubmissionDocumentViewer
            url={signedUrl}
            mimeType={submission.mimeType}
            className="h-full rounded-none border-0"
          />
        </div>
        <div className="flex-[3] overflow-y-auto">
          <MarkingPanel
            submissionId={submission.id}
            groupName={submission.group.name}
            maxMarks={submission.coursework.maxMarks}
            existingMark={
              submission.mark
                ? {
                    awarded: submission.mark.awarded,
                    feedback: submission.mark.feedback,
                    status: submission.mark.status,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
