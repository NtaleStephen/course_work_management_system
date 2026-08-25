import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeadlineBadge } from "@/components/shared/deadline-badge";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import { deriveSubmissionStatus } from "@/lib/submission-status";
import type { Coursework, Submission, Mark } from "@/lib/generated/prisma/client";

export function CourseworkCard({
  coursework,
  latestSubmission,
}: {
  coursework: Coursework;
  latestSubmission: (Submission & { mark: Mark | null }) | undefined;
}) {
  const status = deriveSubmissionStatus({
    submission: latestSubmission
      ? {
          status: latestSubmission.status,
          mark: latestSubmission.mark
            ? { status: latestSubmission.mark.status }
            : null,
        }
      : null,
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground">{coursework.title}</p>
          <DeadlineBadge deadline={coursework.deadline} />
        </div>

        {status === "RESULT_PUBLISHED" ? (
          <p className="text-sm font-medium text-foreground">
            Result: {latestSubmission!.mark!.awarded}/
            {latestSubmission!.mark!.maxMarks}
          </p>
        ) : (
          <SubmissionStatusBadge status={status} />
        )}

        <Button
          size="sm"
          className="w-full"
          render={
            <Link
              href={
                status === "RESULT_PUBLISHED"
                  ? "/leader/results"
                  : `/leader/coursework/${coursework.id}`
              }
            />
          }
        >
          {status === "RESULT_PUBLISHED"
            ? "View Result"
            : latestSubmission
              ? "View Submission"
              : "Submit Work"}
        </Button>
      </CardContent>
    </Card>
  );
}
