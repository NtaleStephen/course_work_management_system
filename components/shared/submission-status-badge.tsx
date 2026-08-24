import { Badge } from "@/components/ui/badge";
import type { DerivedSubmissionStatus } from "@/lib/submission-status";

// Colors follow design.md §41. Submitted and Result Published are both
// "Green" per spec but use distinguishable shades since they share a badge
// vocabulary in the same tables -- text differs too, per §41's "don't rely
// on color alone" rule.
export function SubmissionStatusBadge({
  status,
}: {
  status: DerivedSubmissionStatus;
}) {
  switch (status) {
    case "NOT_SUBMITTED":
      return <Badge variant="secondary">Not Submitted</Badge>;
    case "LATE":
      return (
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
          Late
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge className="border-green-200 bg-green-50 text-green-700">
          Submitted
        </Badge>
      );
    case "MARKED":
      return (
        <Badge className="border-blue-200 bg-blue-50 text-blue-700">
          Marked
        </Badge>
      );
    case "RESULT_PUBLISHED":
      return (
        <Badge className="border-transparent bg-green-600 text-white">
          Result Published
        </Badge>
      );
  }
}
