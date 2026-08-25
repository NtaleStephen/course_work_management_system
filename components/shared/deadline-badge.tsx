import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDeadlineUrgency } from "@/lib/deadline-urgency";

const URGENCY_STYLES: Record<string, string> = {
  normal: "border-border bg-transparent text-muted-foreground",
  "due-tomorrow": "border-amber-200 bg-amber-50 text-amber-700",
  "due-today": "border-orange-200 bg-orange-50 text-orange-700",
  late: "border-red-200 bg-red-50 text-red-700",
};

export function DeadlineBadge({ deadline }: { deadline: Date }) {
  const urgency = getDeadlineUrgency(deadline);
  const label =
    urgency === "late"
      ? "Late"
      : urgency === "due-today"
        ? "Due today"
        : urgency === "due-tomorrow"
          ? "Due tomorrow"
          : `Due ${format(deadline, "d MMM")}`;

  return (
    <Badge variant="outline" className={cn(URGENCY_STYLES[urgency])}>
      {label}
    </Badge>
  );
}
