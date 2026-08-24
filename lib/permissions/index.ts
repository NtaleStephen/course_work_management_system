import { prisma } from "@/lib/db/client";
import type { User } from "@/lib/generated/prisma/client";

// Resource-ownership checks. Every Server Action / Route Handler that
// touches a specific course/group/coursework/submission must call one of
// these before reading or mutating it (business-logic.md §28). Route-group
// role gating (is this user a LECTURER at all) lives in lib/auth/require-role
// instead -- these functions assume that's already been established and
// focus purely on "does THIS user own THIS resource."

export async function canManageCourse(
  user: User,
  courseId: string
): Promise<boolean> {
  if (user.role === "ADMIN") return true;
  if (user.role !== "LECTURER") return false;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  return course?.lecturerId === user.id;
}

export async function canAccessGroup(
  user: User,
  groupId: string
): Promise<boolean> {
  if (user.role === "ADMIN") return true;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { course: true },
  });
  if (!group) return false;

  if (user.role === "LECTURER") return group.course.lecturerId === user.id;
  if (user.role === "GROUP_LEADER") return group.leaderId === user.id;
  return false;
}

export async function canAccessCoursework(
  user: User,
  courseworkId: string
): Promise<boolean> {
  if (user.role === "ADMIN") return true;

  const coursework = await prisma.coursework.findUnique({
    where: { id: courseworkId },
  });
  if (!coursework) return false;

  if (user.role === "LECTURER") return coursework.lecturerId === user.id;

  if (user.role === "GROUP_LEADER") {
    // Drafts are invisible to every group leader, assigned or not (business-logic.md §10).
    if (coursework.status !== "PUBLISHED") return false;

    const assignment = await prisma.courseworkGroup.findFirst({
      where: { courseworkId, group: { leaderId: user.id } },
    });
    return assignment !== null;
  }

  return false;
}

export async function canMarkSubmission(
  user: User,
  submissionId: string
): Promise<boolean> {
  // LECTURER-only, deliberately -- the owning admin does not automatically
  // gain mark-editing rights (business-logic.md §3.1); no override exists yet.
  if (user.role !== "LECTURER") return false;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { coursework: true },
  });

  return submission?.coursework.lecturerId === user.id;
}
