import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { createAdminClient } from "@/lib/auth/admin-client";
import { SUBMISSIONS_BUCKET } from "@/lib/storage/submissions";
import type { User } from "@/lib/generated/prisma/client";

// Server Actions call requireRole() (Next.js request-scoped auth) and
// revalidatePath() (Next.js render cache) -- neither has meaning outside an
// actual request, so both are mocked. This keeps the rest of each action
// (permission checks, Prisma writes, Storage calls) real against the dev
// Supabase project, which is the actual point of an integration test.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/require-role", () => ({ requireRole: vi.fn() }));

import { requireRole } from "@/lib/auth/require-role";
import { uploadSubmission } from "@/app/leader/coursework/[id]/actions";
import { saveMark, publishResult } from "@/app/marking/[submissionId]/actions";

const mockedRequireRole = vi.mocked(requireRole);

function pdfFile(name: string, bytes: Uint8Array | number[]): File {
  return new File([new Uint8Array(bytes)], name, {
    type: "application/pdf",
  });
}

const MINIMAL_PDF_BYTES = new TextEncoder().encode(
  "%PDF-1.4\n% minimal test file"
);

describe("submission upload (integration)", () => {
  let lecturer: User;
  let leader: User;
  let courseId: string;
  let groupId: string;
  let onTimeCourseworkId: string;
  let lateDisabledCourseworkId: string;
  let lateAllowedCourseworkId: string;
  const uploadedPaths: string[] = [];

  beforeAll(async () => {
    lecturer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `lecturer-${randomUUID()}@test.local`,
        name: "Upload Test Lecturer",
        role: "LECTURER",
      },
    });
    leader = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `leader-${randomUUID()}@test.local`,
        name: "Upload Test Leader",
        role: "GROUP_LEADER",
      },
    });

    const course = await prisma.course.create({
      data: {
        name: "Upload Test Course",
        code: `UTC-${randomUUID().slice(0, 8)}`,
        lecturerId: lecturer.id,
      },
    });
    courseId = course.id;

    const group = await prisma.group.create({
      data: { name: "Upload Test Group", courseId, leaderId: leader.id },
    });
    groupId = group.id;

    const onTime = await prisma.coursework.create({
      data: {
        title: "On Time Coursework",
        instructions: "Do it",
        maxMarks: 20,
        deadline: new Date(Date.now() + 86_400_000),
        allowLateSubmission: false,
        status: "PUBLISHED",
        courseId,
        lecturerId: lecturer.id,
      },
    });
    onTimeCourseworkId = onTime.id;

    const lateDisabled = await prisma.coursework.create({
      data: {
        title: "Late Disabled Coursework",
        instructions: "Do it",
        maxMarks: 20,
        deadline: new Date(Date.now() - 86_400_000),
        allowLateSubmission: false,
        status: "PUBLISHED",
        courseId,
        lecturerId: lecturer.id,
      },
    });
    lateDisabledCourseworkId = lateDisabled.id;

    const lateAllowed = await prisma.coursework.create({
      data: {
        title: "Late Allowed Coursework",
        instructions: "Do it",
        maxMarks: 20,
        deadline: new Date(Date.now() - 86_400_000),
        allowLateSubmission: true,
        status: "PUBLISHED",
        courseId,
        lecturerId: lecturer.id,
      },
    });
    lateAllowedCourseworkId = lateAllowed.id;

    for (const cwId of [
      onTimeCourseworkId,
      lateDisabledCourseworkId,
      lateAllowedCourseworkId,
    ]) {
      await prisma.courseworkGroup.create({
        data: { courseworkId: cwId, groupId },
      });
    }

    mockedRequireRole.mockResolvedValue(leader);
  });

  afterAll(async () => {
    const supabase = createAdminClient();
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(SUBMISSIONS_BUCKET).remove(uploadedPaths);
    }
    await prisma.submission.deleteMany({ where: { groupId } });
    await prisma.courseworkGroup.deleteMany({ where: { groupId } });
    await prisma.coursework.deleteMany({ where: { courseId } });
    await prisma.group.deleteMany({ where: { id: groupId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.auditLog.deleteMany({
      where: { userId: { in: [lecturer.id, leader.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [lecturer.id, leader.id] } },
    });
  });

  it("uploads a valid on-time submission and persists it consistently in storage and the DB", async () => {
    const formData = new FormData();
    formData.set("courseworkId", onTimeCourseworkId);
    formData.set("file", pdfFile("work.pdf", MINIMAL_PDF_BYTES));

    const result = await uploadSubmission({}, formData);
    expect(result.ok).toBe(true);

    const submission = await prisma.submission.findFirstOrThrow({
      where: { courseworkId: onTimeCourseworkId, groupId },
    });
    expect(submission.status).toBe("SUBMITTED");
    expect(submission.fileName).toBe("work.pdf");
    expect(submission.fileSize).toBe(MINIMAL_PDF_BYTES.length);
    uploadedPaths.push(submission.filePath);

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(SUBMISSIONS_BUCKET)
      .download(submission.filePath);
    expect(error).toBeNull();
    const downloaded = new Uint8Array(await data!.arrayBuffer());
    expect(Array.from(downloaded)).toEqual(Array.from(MINIMAL_PDF_BYTES));
  });

  it("rejects an unsupported file type without creating a submission", async () => {
    const formData = new FormData();
    formData.set("courseworkId", onTimeCourseworkId);
    formData.set(
      "file",
      new File(["console.log('x')"], "work.js", {
        type: "application/javascript",
      })
    );

    const result = await uploadSubmission({}, formData);
    expect(result.error).toBeTruthy();

    const count = await prisma.submission.count({
      where: { courseworkId: onTimeCourseworkId, groupId, fileName: "work.js" },
    });
    expect(count).toBe(0);
  });

  it("rejects a file over the size limit without creating a submission", async () => {
    const { MAX_SUBMISSION_SIZE_BYTES } = await import(
      "@/lib/storage/submissions"
    );
    const oversized = new File(
      [new Uint8Array(MAX_SUBMISSION_SIZE_BYTES + 1)],
      "huge.pdf",
      { type: "application/pdf" }
    );
    const formData = new FormData();
    formData.set("courseworkId", onTimeCourseworkId);
    formData.set("file", oversized);

    const result = await uploadSubmission({}, formData);
    expect(result.error).toBeTruthy();

    const count = await prisma.submission.count({
      where: {
        courseworkId: onTimeCourseworkId,
        groupId,
        fileName: "huge.pdf",
      },
    });
    expect(count).toBe(0);
  });

  it("rejects a late submission when the coursework disallows it", async () => {
    const formData = new FormData();
    formData.set("courseworkId", lateDisabledCourseworkId);
    formData.set("file", pdfFile("late.pdf", MINIMAL_PDF_BYTES));

    const result = await uploadSubmission({}, formData);
    expect(result.error).toBe("The coursework deadline has passed.");

    const count = await prisma.submission.count({
      where: { courseworkId: lateDisabledCourseworkId, groupId },
    });
    expect(count).toBe(0);
  });

  it("accepts and marks LATE a submission when the coursework allows it", async () => {
    const formData = new FormData();
    formData.set("courseworkId", lateAllowedCourseworkId);
    formData.set("file", pdfFile("late-ok.pdf", MINIMAL_PDF_BYTES));

    const result = await uploadSubmission({}, formData);
    expect(result.ok).toBe(true);

    const submission = await prisma.submission.findFirstOrThrow({
      where: { courseworkId: lateAllowedCourseworkId, groupId },
    });
    expect(submission.status).toBe("LATE");
    uploadedPaths.push(submission.filePath);
  });
});

describe("mark save/publish state transitions (integration)", () => {
  let lecturer: User;
  let otherLecturer: User;
  let leader: User;
  let courseId: string;
  let groupId: string;
  let courseworkId: string;
  let submissionId: string;

  beforeAll(async () => {
    lecturer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `mark-lecturer-${randomUUID()}@test.local`,
        name: "Mark Test Lecturer",
        role: "LECTURER",
      },
    });
    otherLecturer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `mark-other-lecturer-${randomUUID()}@test.local`,
        name: "Other Lecturer",
        role: "LECTURER",
      },
    });
    leader = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `mark-leader-${randomUUID()}@test.local`,
        name: "Mark Test Leader",
        role: "GROUP_LEADER",
      },
    });

    const course = await prisma.course.create({
      data: {
        name: "Mark Test Course",
        code: `MTC-${randomUUID().slice(0, 8)}`,
        lecturerId: lecturer.id,
      },
    });
    courseId = course.id;

    const group = await prisma.group.create({
      data: { name: "Mark Test Group", courseId, leaderId: leader.id },
    });
    groupId = group.id;

    const coursework = await prisma.coursework.create({
      data: {
        title: "Mark Test Coursework",
        instructions: "Do it",
        maxMarks: 20,
        deadline: new Date(Date.now() + 86_400_000),
        status: "PUBLISHED",
        courseId,
        lecturerId: lecturer.id,
      },
    });
    courseworkId = coursework.id;

    const submission = await prisma.submission.create({
      data: {
        courseworkId,
        groupId,
        fileName: "work.pdf",
        filePath: "test/mark-workflow-work.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
        version: 1,
        status: "SUBMITTED",
      },
    });
    submissionId = submission.id;
  });

  afterAll(async () => {
    await prisma.mark.deleteMany({ where: { submissionId } });
    await prisma.submission.deleteMany({ where: { groupId } });
    await prisma.coursework.deleteMany({ where: { courseId } });
    await prisma.group.deleteMany({ where: { id: groupId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.auditLog.deleteMany({
      where: { userId: { in: [lecturer.id, otherLecturer.id, leader.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [lecturer.id, otherLecturer.id, leader.id] } },
    });
  });

  it("creates a SAVED mark, hidden from the leader, on first save", async () => {
    mockedRequireRole.mockResolvedValue(lecturer);
    const formData = new FormData();
    formData.set("submissionId", submissionId);
    formData.set("awarded", "18");
    formData.set("feedback", "Good understanding, examples could improve.");

    const result = await saveMark({}, formData);
    expect(result.ok).toBe(true);

    const mark = await prisma.mark.findUniqueOrThrow({
      where: { submissionId },
    });
    expect(mark.status).toBe("SAVED");
    expect(mark.awarded).toBe(18);

    const audit = await prisma.auditLog.findFirst({
      where: { action: "AWARD_MARK", resourceId: mark.id },
    });
    expect(audit).not.toBeNull();
  });

  it("updates the same mark row on a second save, without duplicating it", async () => {
    const formData = new FormData();
    formData.set("submissionId", submissionId);
    formData.set("awarded", "19");
    formData.set("feedback", "Revised feedback.");

    const result = await saveMark({}, formData);
    expect(result.ok).toBe(true);

    const marks = await prisma.mark.findMany({ where: { submissionId } });
    expect(marks).toHaveLength(1);
    expect(marks[0].awarded).toBe(19);
    expect(marks[0].status).toBe("SAVED");

    const audit = await prisma.auditLog.findFirst({
      where: { action: "UPDATE_MARK", resourceId: marks[0].id },
    });
    expect(audit).not.toBeNull();
  });

  it("rejects a mark above the coursework's maximum, leaving the mark unchanged", async () => {
    const formData = new FormData();
    formData.set("submissionId", submissionId);
    formData.set("awarded", "21");

    const result = await saveMark({}, formData);
    expect(result.error).toBeTruthy();

    const mark = await prisma.mark.findUniqueOrThrow({
      where: { submissionId },
    });
    expect(mark.awarded).toBe(19);
  });

  it("denies a different lecturer from marking this submission", async () => {
    mockedRequireRole.mockResolvedValue(otherLecturer);
    const formData = new FormData();
    formData.set("submissionId", submissionId);
    formData.set("awarded", "5");

    const result = await saveMark({}, formData);
    expect(result.error).toBe(
      "You are not authorized to mark this submission."
    );

    mockedRequireRole.mockResolvedValue(lecturer);
  });

  it("publishes the result, making it visible", async () => {
    const formData = new FormData();
    formData.set("submissionId", submissionId);

    const result = await publishResult({}, formData);
    expect(result.ok).toBe(true);

    const mark = await prisma.mark.findUniqueOrThrow({
      where: { submissionId },
    });
    expect(mark.status).toBe("PUBLISHED");
    expect(mark.publishedAt).not.toBeNull();

    const audit = await prisma.auditLog.findFirst({
      where: { action: "PUBLISH_RESULT", resourceId: mark.id },
    });
    expect(audit).not.toBeNull();
  });

  it("rejects publishing an already-published result", async () => {
    const formData = new FormData();
    formData.set("submissionId", submissionId);

    const result = await publishResult({}, formData);
    expect(result.error).toBe("This result has already been published.");
  });
});
