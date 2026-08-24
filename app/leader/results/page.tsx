import { format } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { Card, CardContent } from "@/components/ui/card";

// Parameterless by design, like /leader/group -- always scoped to the
// caller's own group via group.leaderId, so a leader can never guess their
// way into another group's results (business-logic.md §28).
export default async function LeaderResultsPage() {
  const leader = await requireRole("GROUP_LEADER");

  const submissions = await prisma.submission.findMany({
    where: { group: { leaderId: leader.id }, mark: { status: "PUBLISHED" } },
    include: { coursework: true, mark: true },
    orderBy: { mark: { publishedAt: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          My Results
        </h1>
        <p className="text-sm text-muted-foreground">
          Published marks and feedback for your group.
        </p>
      </div>

      {submissions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No results have been published yet.
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const mark = submission.mark!;
            const percentage = Math.round(
              (mark.awarded / mark.maxMarks) * 100
            );
            return (
              <Card key={submission.id}>
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    {submission.coursework.title}
                  </h2>

                  <div className="text-center">
                    <p className="text-3xl font-semibold text-foreground">
                      {mark.awarded} / {mark.maxMarks}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {percentage}%
                    </p>
                  </div>

                  {mark.feedback ? (
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Feedback
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {mark.feedback}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Submitted</p>
                      <p className="font-medium text-foreground">
                        {format(submission.submittedAt, "d MMM yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Marked</p>
                      <p className="font-medium text-foreground">
                        {format(mark.markedAt, "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
