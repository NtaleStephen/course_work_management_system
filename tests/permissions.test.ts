import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/client";
import {
  canAccessCoursework,
  canAccessGroup,
  canManageCourse,
  canMarkSubmission,
} from "@/lib/permissions";
import type { User } from "@/lib/generated/prisma/client";

describe("lib/permissions", () => {
  let admin: User;
  let lecturerA: User;
  let lecturerB: User;
  let leader1: User;
  let leader2: User;

  let courseId: string;
  let groupId: string;
  let publishedCourseworkId: string;
  let draftCourseworkId: string;
  let submissionId: string;

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `admin-${randomUUID()}@test.local`,
        name: "Test Admin",
        role: "ADMIN",
      },
    });
    lecturerA = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `lecturerA-${randomUUID()}@test.local`,
        name: "Lecturer A",
        role: "LECTURER",
      },
    });
    lecturerB = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `lecturerB-${randomUUID()}@test.local`,
        name: "Lecturer B",
        role: "LECTURER",
      },
    });
    leader1 = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `leader1-${randomUUID()}@test.local`,
        name: "Leader One",
        role: "GROUP_LEADER",
      },
    });
    leader2 = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `leader2-${randomUUID()}@test.local`,
        name: "Leader Two",
        role: "GROUP_LEADER",
      },
    });

    const course = await prisma.course.create({
      data: {
        name: "Test Course",
        code: `TC-${randomUUID().slice(0, 8)}`,
        lecturerId: lecturerA.id,
      },
    });
    courseId = course.id;

    const group = await prisma.group.create({
      data: { name: "Test Group", courseId, leaderId: leader1.id },
    });
    groupId = group.id;

    const publishedCoursework = await prisma.coursework.create({
      data: {
        title: "Published Coursework",
        instructions: "Do the thing",
        maxMarks: 20,
        deadline: new Date(Date.now() + 86_400_000),
        status: "PUBLISHED",
        courseId,
        lecturerId: lecturerA.id,
      },
    });
    publishedCourseworkId = publishedCoursework.id;

    const draftCoursework = await prisma.coursework.create({
      data: {
        title: "Draft Coursework",
        instructions: "Do the other thing",
        maxMarks: 20,
        deadline: new Date(Date.now() + 86_400_000),
        status: "DRAFT",
        courseId,
        lecturerId: lecturerA.id,
      },
    });
    draftCourseworkId = draftCoursework.id;

    await prisma.courseworkGroup.create({
      data: { courseworkId: publishedCourseworkId, groupId },
    });
    await prisma.courseworkGroup.create({
      data: { courseworkId: draftCourseworkId, groupId },
    });

    const submission = await prisma.submission.create({
      data: {
        courseworkId: publishedCourseworkId,
        groupId,
        fileName: "work.pdf",
        filePath: "test/work.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
        version: 1,
        status: "SUBMITTED",
      },
    });
    submissionId = submission.id;
  });

  afterAll(async () => {
    await prisma.submission.deleteMany({ where: { groupId } });
    await prisma.courseworkGroup.deleteMany({ where: { groupId } });
    await prisma.coursework.deleteMany({ where: { courseId } });
    await prisma.group.deleteMany({ where: { id: groupId } });
    await prisma.course.deleteMany({ where: { id: courseId } });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [admin.id, lecturerA.id, lecturerB.id, leader1.id, leader2.id],
        },
      },
    });
  });

  describe("canManageCourse", () => {
    it("allows admin", async () => {
      expect(await canManageCourse(admin, courseId)).toBe(true);
    });
    it("allows the owning lecturer", async () => {
      expect(await canManageCourse(lecturerA, courseId)).toBe(true);
    });
    it("denies a different lecturer", async () => {
      expect(await canManageCourse(lecturerB, courseId)).toBe(false);
    });
    it("denies a group leader", async () => {
      expect(await canManageCourse(leader1, courseId)).toBe(false);
    });
  });

  describe("canAccessGroup", () => {
    it("allows admin", async () => {
      expect(await canAccessGroup(admin, groupId)).toBe(true);
    });
    it("allows the course's lecturer", async () => {
      expect(await canAccessGroup(lecturerA, groupId)).toBe(true);
    });
    it("denies a different lecturer", async () => {
      expect(await canAccessGroup(lecturerB, groupId)).toBe(false);
    });
    it("allows the group's own leader", async () => {
      expect(await canAccessGroup(leader1, groupId)).toBe(true);
    });
    it("denies a different group leader", async () => {
      expect(await canAccessGroup(leader2, groupId)).toBe(false);
    });
  });

  describe("canAccessCoursework", () => {
    it("allows admin", async () => {
      expect(await canAccessCoursework(admin, publishedCourseworkId)).toBe(
        true
      );
    });
    it("allows the owning lecturer", async () => {
      expect(
        await canAccessCoursework(lecturerA, publishedCourseworkId)
      ).toBe(true);
    });
    it("denies a different lecturer", async () => {
      expect(
        await canAccessCoursework(lecturerB, publishedCourseworkId)
      ).toBe(false);
    });
    it("allows an assigned group's leader when published", async () => {
      expect(await canAccessCoursework(leader1, publishedCourseworkId)).toBe(
        true
      );
    });
    it("denies an unassigned group's leader", async () => {
      expect(await canAccessCoursework(leader2, publishedCourseworkId)).toBe(
        false
      );
    });
    it("denies an assigned group's leader while still a draft", async () => {
      expect(await canAccessCoursework(leader1, draftCourseworkId)).toBe(
        false
      );
    });
  });

  describe("canMarkSubmission", () => {
    it("allows the owning lecturer", async () => {
      expect(await canMarkSubmission(lecturerA, submissionId)).toBe(true);
    });
    it("denies a different lecturer", async () => {
      expect(await canMarkSubmission(lecturerB, submissionId)).toBe(false);
    });
    it("denies admin (no mark override exists yet)", async () => {
      expect(await canMarkSubmission(admin, submissionId)).toBe(false);
    });
    it("denies a group leader", async () => {
      expect(await canMarkSubmission(leader1, submissionId)).toBe(false);
    });
  });
});
