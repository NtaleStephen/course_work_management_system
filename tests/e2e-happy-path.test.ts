import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { createAdminClient } from "@/lib/auth/admin-client";
import { SUBMISSIONS_BUCKET } from "@/lib/storage/submissions";

// business-logic.md §35 / tech-stack.md §33's full workflow, chained through
// the actual Server Actions rather than reimplemented against Prisma
// directly -- this is the one test that proves the whole system fits
// together, not just its individual pieces.
//
// requireRole and revalidatePath are mocked because they're Next.js
// request-scoped (no meaning outside an actual HTTP request); redirect is
// mocked to throw a recognizable marker matching Next's real redirect()
// behavior (it also throws, via a `digest` field) so createCoursework's
// redirect-on-success path can be asserted on without a real Next request.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/require-role", () => ({ requireRole: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`NEXT_REDIRECT to ${url}`);
    (err as unknown as { digest: string }).digest = `NEXT_REDIRECT;${url}`;
    throw err;
  }),
}));

import { requireRole } from "@/lib/auth/require-role";
import { createLecturer } from "@/app/admin/lecturers/actions";
import { createCourse } from "@/app/admin/courses/actions";
import { createGroup } from "@/app/admin/groups/actions";
import { addMember } from "@/app/leader/group/actions";
import { createCoursework } from "@/app/lecturer/coursework/actions";
import { uploadSubmission } from "@/app/leader/coursework/[id]/actions";
import { saveMark, publishResult } from "@/app/marking/[submissionId]/actions";

const mockedRequireRole = vi.mocked(requireRole);

function isNextRedirect(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const digest = (err as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

describe("E2E happy path: admin setup through published result (business-logic.md §35)", () => {
  const suffix = randomUUID().slice(0, 8);
  const lecturerEmail = `e2e-lecturer-${suffix}@test.local`;
  const leaderEmail = `e2e-leader-${suffix}@test.local`;
  const courseCode = `E2E-${suffix}`;
  const uploadedPaths: string[] = [];

  let adminUser: { id: string; role: "ADMIN" };
  let lecturerId: string;
  let leaderId: string;
  let courseId: string;
  let groupId: string;
  let courseworkId: string;
  let submissionId: string;

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `e2e-admin-${suffix}@test.local`,
        name: "E2E Admin",
        role: "ADMIN",
      },
    });
    adminUser = { id: admin.id, role: "ADMIN" };
  });

  afterAll(async () => {
    const supabaseAdmin = createAdminClient();

    if (uploadedPaths.length > 0) {
      await supabaseAdmin.storage
        .from(SUBMISSIONS_BUCKET)
        .remove(uploadedPaths);
    }
    if (submissionId) {
      await prisma.mark.deleteMany({ where: { submissionId } });
    }
    if (groupId) {
      await prisma.submission.deleteMany({ where: { groupId } });
      await prisma.groupMember.deleteMany({ where: { groupId } });
    }
    if (courseId) {
      await prisma.courseworkGroup.deleteMany({
        where: { coursework: { courseId } },
      });
      await prisma.coursework.deleteMany({ where: { courseId } });
    }
    if (groupId) await prisma.group.deleteMany({ where: { id: groupId } });
    if (courseId) await prisma.course.deleteMany({ where: { id: courseId } });

    const userIds = [adminUser.id, lecturerId, leaderId].filter(Boolean);
    await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });

    for (const id of [lecturerId, leaderId]) {
      if (id) await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
    }
  });

  it("1-2. admin creates the lecturer and their course", async () => {
    mockedRequireRole.mockResolvedValue(adminUser as never);

    const lecturerForm = new FormData();
    lecturerForm.set("name", "E2E Lecturer");
    lecturerForm.set("email", lecturerEmail);
    const lecturerResult = await createLecturer({}, lecturerForm);
    expect(lecturerResult.success).toBeTruthy();

    const lecturer = await prisma.user.findUniqueOrThrow({
      where: { email: lecturerEmail },
    });
    lecturerId = lecturer.id;

    const courseForm = new FormData();
    courseForm.set("name", "E2E Course");
    courseForm.set("code", courseCode);
    courseForm.set("lecturerId", lecturerId);
    const courseResult = await createCourse({}, courseForm);
    expect(courseResult.ok).toBe(true);

    const course = await prisma.course.findUniqueOrThrow({
      where: { code: courseCode },
    });
    courseId = course.id;
  });

  it("3-4. admin creates the group and assigns its leader", async () => {
    const groupForm = new FormData();
    groupForm.set("name", "E2E Group");
    groupForm.set("courseId", courseId);
    groupForm.set("leaderName", "E2E Leader");
    groupForm.set("leaderEmail", leaderEmail);
    const groupResult = await createGroup({}, groupForm);
    expect(groupResult.success?.leaderEmail).toBe(leaderEmail);

    const leader = await prisma.user.findUniqueOrThrow({
      where: { email: leaderEmail },
    });
    leaderId = leader.id;

    const group = await prisma.group.findUniqueOrThrow({
      where: { leaderId },
    });
    groupId = group.id;
  });

  it("5. group leader adds a member", async () => {
    mockedRequireRole.mockResolvedValue({
      id: leaderId,
      role: "GROUP_LEADER",
    } as never);

    const memberForm = new FormData();
    memberForm.set("name", "Jane Member");
    memberForm.set("registrationNumber", `23/U/${suffix}`);
    memberForm.set("course", "BSc Computer Science");
    const memberResult = await addMember({}, memberForm);
    expect(memberResult.ok).toBe(true);

    const memberCount = await prisma.groupMember.count({ where: { groupId } });
    expect(memberCount).toBe(1);
  });

  it("6-11. lecturer creates coursework, selects the group, and publishes it", async () => {
    mockedRequireRole.mockResolvedValue({ id: lecturerId, role: "LECTURER" } as never);

    const courseworkForm = new FormData();
    courseworkForm.set("title", "E2E Coursework");
    courseworkForm.set("instructions", "Explain the thing");
    courseworkForm.set("maxMarks", "20");
    courseworkForm.set(
      "deadline",
      new Date(Date.now() + 7 * 86_400_000).toISOString()
    );
    courseworkForm.set("courseId", courseId);
    courseworkForm.set("allowLateSubmission", "on");
    courseworkForm.append("groupIds", groupId);
    courseworkForm.set("intent", "publish");

    let redirected = false;
    try {
      await createCoursework({}, courseworkForm);
    } catch (err) {
      if (!isNextRedirect(err)) throw err;
      redirected = true;
    }
    expect(redirected).toBe(true);

    const coursework = await prisma.coursework.findFirstOrThrow({
      where: { title: "E2E Coursework", courseId },
    });
    courseworkId = coursework.id;
    expect(coursework.status).toBe("PUBLISHED");

    const assignment = await prisma.courseworkGroup.findFirst({
      where: { courseworkId, groupId },
    });
    expect(assignment).not.toBeNull();
  });

  it("12-16. group leader opens the coursework and uploads their submission on time", async () => {
    mockedRequireRole.mockResolvedValue({
      id: leaderId,
      role: "GROUP_LEADER",
    } as never);

    const fileBytes = new TextEncoder().encode("%PDF-1.4\n% e2e test file");
    const uploadForm = new FormData();
    uploadForm.set("courseworkId", courseworkId);
    uploadForm.set(
      "file",
      new File([fileBytes], "e2e-work.pdf", { type: "application/pdf" })
    );

    const uploadResult = await uploadSubmission({}, uploadForm);
    expect(uploadResult.ok).toBe(true);

    const submission = await prisma.submission.findFirstOrThrow({
      where: { courseworkId, groupId },
    });
    submissionId = submission.id;
    uploadedPaths.push(submission.filePath);
    expect(submission.status).toBe("SUBMITTED");
  });

  it("17-22. lecturer sees the submission, awards a mark, and saves it (still hidden)", async () => {
    mockedRequireRole.mockResolvedValue({ id: lecturerId, role: "LECTURER" } as never);

    const markForm = new FormData();
    markForm.set("submissionId", submissionId);
    markForm.set("awarded", "18");
    markForm.set("feedback", "Well explained, good examples.");
    const markResult = await saveMark({}, markForm);
    expect(markResult.ok).toBe(true);

    const mark = await prisma.mark.findUniqueOrThrow({
      where: { submissionId },
    });
    expect(mark.status).toBe("SAVED");

    // Not yet visible to the leader's own results view.
    const visibleToLeader = await prisma.submission.findFirst({
      where: { id: submissionId, group: { leaderId }, mark: { status: "PUBLISHED" } },
    });
    expect(visibleToLeader).toBeNull();
  });

  it("23. lecturer publishes the result", async () => {
    const publishForm = new FormData();
    publishForm.set("submissionId", submissionId);
    const publishResultState = await publishResult({}, publishForm);
    expect(publishResultState.ok).toBe(true);
  });

  it("24. group leader sees the published result", async () => {
    // Mirrors the exact query /leader/results uses -- group-scoped by
    // leaderId, never by a client-supplied group/submission id.
    const results = await prisma.submission.findMany({
      where: { group: { leaderId }, mark: { status: "PUBLISHED" } },
      include: { coursework: true, mark: true },
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(submissionId);
    expect(results[0].mark?.awarded).toBe(18);
    expect(results[0].mark?.maxMarks).toBe(20);
    expect(results[0].coursework.title).toBe("E2E Coursework");
  });

  it("25. the coursework and submission remain available as historical data", async () => {
    const coursework = await prisma.coursework.findUniqueOrThrow({
      where: { id: courseworkId },
    });
    const submission = await prisma.submission.findUniqueOrThrow({
      where: { id: submissionId },
    });
    expect(coursework.status).toBe("PUBLISHED");
    expect(submission.id).toBe(submissionId);
  });
});
