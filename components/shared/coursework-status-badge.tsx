import { Badge } from "@/components/ui/badge";
import type { CourseworkDisplayStatus } from "@/lib/coursework-status";

export function CourseworkStatusBadge({
  status,
}: {
  status: CourseworkDisplayStatus;
}) {
  if (status === "DRAFT") {
    return <Badge variant="secondary">Draft</Badge>;
  }
  if (status === "CLOSED") {
    return <Badge variant="secondary">Closed</Badge>;
  }
  return (
    <Badge className="border-green-200 bg-green-50 text-green-700">
      Active
    </Badge>
  );
}
