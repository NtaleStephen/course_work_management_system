import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { isValidMark, saveMarkSchema } from "@/lib/validation/mark";

describe("isValidMark", () => {
  // business-logic.md §18: Maximum = 20; Valid: 0, 10, 18, 20; Invalid: -1, 21, 25
  const maxMarks = 20;

  it.each([0, 10, 18, 20])("accepts %i as valid for max 20", (awarded) => {
    expect(isValidMark(awarded, maxMarks)).toBe(true);
  });

  it.each([-1, 21, 25])("rejects %i as invalid for max 20", (awarded) => {
    expect(isValidMark(awarded, maxMarks)).toBe(false);
  });

  it("rejects non-integer marks", () => {
    expect(isValidMark(18.5, maxMarks)).toBe(false);
  });

  it("accepts 0 when max marks is 0's neighbor edge case (max 1)", () => {
    expect(isValidMark(0, 1)).toBe(true);
    expect(isValidMark(1, 1)).toBe(true);
    expect(isValidMark(2, 1)).toBe(false);
  });
});

describe("saveMarkSchema", () => {
  const submissionId = randomUUID();

  it("parses a valid submission", () => {
    const result = saveMarkSchema.safeParse({
      submissionId,
      awarded: "18",
      feedback: "Good work",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.awarded).toBe(18);
    }
  });

  it("rejects negative marks at the schema level", () => {
    const result = saveMarkSchema.safeParse({
      submissionId,
      awarded: "-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer marks at the schema level", () => {
    const result = saveMarkSchema.safeParse({
      submissionId,
      awarded: "18.5",
    });
    expect(result.success).toBe(false);
  });

  it("allows omitted feedback", () => {
    const result = saveMarkSchema.safeParse({
      submissionId,
      awarded: "20",
    });
    expect(result.success).toBe(true);
  });
});
