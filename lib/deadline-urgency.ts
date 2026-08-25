import { differenceInCalendarDays } from "date-fns";

export type DeadlineUrgency = "normal" | "due-tomorrow" | "due-today" | "late";

// Tiers escalate as the deadline approaches (design.md §42). Threshold is
// calendar-day based, not a fixed 24h window, so "due today" holds for the
// whole day regardless of what time it currently is.
export function getDeadlineUrgency(
  deadline: Date,
  now: Date = new Date()
): DeadlineUrgency {
  const days = differenceInCalendarDays(deadline, now);
  if (days < 0) return "late";
  if (days === 0) return "due-today";
  if (days === 1) return "due-tomorrow";
  return "normal";
}
