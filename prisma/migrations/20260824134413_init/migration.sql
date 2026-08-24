-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LECTURER', 'GROUP_LEADER');

-- CreateEnum
CREATE TYPE "CourseworkStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'LATE');

-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('SAVED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lecturerId" UUID NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" UUID NOT NULL,
    "leaderId" UUID NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" UUID NOT NULL,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coursework" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "status" "CourseworkStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" UUID NOT NULL,
    "lecturerId" UUID NOT NULL,

    CONSTRAINT "Coursework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseworkGroup" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseworkId" UUID NOT NULL,
    "groupId" UUID NOT NULL,

    CONSTRAINT "CourseworkGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseworkId" UUID NOT NULL,
    "groupId" UUID NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" UUID NOT NULL,
    "awarded" INTEGER NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "feedback" TEXT,
    "rubricJson" JSONB,
    "status" "MarkStatus" NOT NULL DEFAULT 'SAVED',
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" UUID NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_lecturerId_idx" ON "Course"("lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_leaderId_key" ON "Group"("leaderId");

-- CreateIndex
CREATE INDEX "Group_courseId_idx" ON "Group"("courseId");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_registrationNumber_key" ON "GroupMember"("groupId", "registrationNumber");

-- CreateIndex
CREATE INDEX "Coursework_courseId_idx" ON "Coursework"("courseId");

-- CreateIndex
CREATE INDEX "Coursework_deadline_idx" ON "Coursework"("deadline");

-- CreateIndex
CREATE INDEX "CourseworkGroup_courseworkId_idx" ON "CourseworkGroup"("courseworkId");

-- CreateIndex
CREATE INDEX "CourseworkGroup_groupId_idx" ON "CourseworkGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseworkGroup_courseworkId_groupId_key" ON "CourseworkGroup"("courseworkId", "groupId");

-- CreateIndex
CREATE INDEX "Submission_courseworkId_idx" ON "Submission"("courseworkId");

-- CreateIndex
CREATE INDEX "Submission_groupId_idx" ON "Submission"("groupId");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_courseworkId_groupId_version_key" ON "Submission"("courseworkId", "groupId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Mark_submissionId_key" ON "Mark"("submissionId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coursework" ADD CONSTRAINT "Coursework_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coursework" ADD CONSTRAINT "Coursework_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseworkGroup" ADD CONSTRAINT "CourseworkGroup_courseworkId_fkey" FOREIGN KEY ("courseworkId") REFERENCES "Coursework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseworkGroup" ADD CONSTRAINT "CourseworkGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_courseworkId_fkey" FOREIGN KEY ("courseworkId") REFERENCES "Coursework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint
ALTER TABLE "Coursework" ADD CONSTRAINT "Coursework_maxMarks_positive" CHECK ("maxMarks" > 0);

-- CheckConstraint
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_awarded_range" CHECK ("awarded" >= 0 AND "awarded" <= "maxMarks");
