import { describe, expect, it } from "vitest";
import { addDays, subDays } from "date-fns";
import { getDeadlineUrgency, isSubmissionLate } from "@/lib/deadline-urgency";

describe("isSubmissionLate", () => {
  it("is false when the deadline is in the future", () => {
    const now = new Date(2026, 7, 30, 12, 0);
    const deadline = new Date(2026, 7, 30, 23, 59);
    expect(isSubmissionLate(deadline, now)).toBe(false);
  });

  it("is false at the exact deadline instant (on time, not late)", () => {
    const deadline = new Date(2026, 7, 30, 23, 59);
    expect(isSubmissionLate(deadline, deadline)).toBe(false);
  });

  it("is true one millisecond after the deadline", () => {
    const deadline = new Date(2026, 7, 30, 23, 59);
    const oneMsLate = new Date(deadline.getTime() + 1);
    expect(isSubmissionLate(deadline, oneMsLate)).toBe(true);
  });

  it("is true when the deadline is well in the past", () => {
    const deadline = new Date(2026, 7, 30, 23, 59);
    const now = addDays(deadline, 2);
    expect(isSubmissionLate(deadline, now)).toBe(true);
  });
});

describe("getDeadlineUrgency", () => {
  // Local-time construction (not ISO/UTC strings) so this matches
  // differenceInCalendarDays' local-timezone calendar-day semantics
  // regardless of what timezone the test happens to run in.
  const deadline = new Date(2026, 7, 30, 23, 59);

  it("is normal several days out", () => {
    const now = subDays(deadline, 10);
    expect(getDeadlineUrgency(deadline, now)).toBe("normal");
  });

  it("is due-tomorrow the calendar day before", () => {
    const now = subDays(deadline, 1);
    expect(getDeadlineUrgency(deadline, now)).toBe("due-tomorrow");
  });

  it("is due-today on the deadline's calendar day, even hours before it", () => {
    const now = new Date(2026, 7, 30, 0, 5);
    expect(getDeadlineUrgency(deadline, now)).toBe("due-today");
  });

  it("is late the calendar day after", () => {
    const now = addDays(deadline, 1);
    expect(getDeadlineUrgency(deadline, now)).toBe("late");
  });
});
