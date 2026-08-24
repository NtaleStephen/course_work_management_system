import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Coursework, Submission } from "@/lib/generated/prisma/client";

function statusBadge(submission: Submission | undefined) {
  if (!submission) {
    return <Badge variant="secondary">Not Submitted</Badge>;
  }
  if (submission.status === "LATE") {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700">
        Late
      </Badge>
    );
  }
  return (
    <Badge className="border-green-200 bg-green-50 text-green-700">
      Submitted
    </Badge>
  );
}

export function CourseworkCard({
  coursework,
  latestSubmission,
}: {
  coursework: Coursework;
  latestSubmission: Submission | undefined;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="font-medium text-foreground">{coursework.title}</p>
          <p className="text-sm text-muted-foreground">
            Due {format(coursework.deadline, "d MMM yyyy, HH:mm")}
          </p>
        </div>
        {statusBadge(latestSubmission)}
        <Button
          size="sm"
          className="w-full"
          render={<Link href={`/leader/coursework/${coursework.id}`} />}
        >
          {latestSubmission ? "View Submission" : "Submit Work"}
        </Button>
      </CardContent>
    </Card>
  );
}
