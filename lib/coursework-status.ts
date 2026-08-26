export type CourseworkDisplayStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export function deriveCourseworkStatus(coursework: {
  status: "DRAFT" | "PUBLISHED";
  deadline: Date;
}): CourseworkDisplayStatus {
  if (coursework.status === "DRAFT") return "DRAFT";
  return coursework.deadline.getTime() < Date.now() ? "CLOSED" : "ACTIVE";
}
