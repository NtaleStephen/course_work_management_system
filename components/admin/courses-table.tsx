"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { EditCourseDialog } from "@/components/admin/edit-course-dialog";
import type { Course, User } from "@/lib/generated/prisma/client";

type CourseWithLecturer = Course & { lecturer: User };

export function CoursesTable({
  courses,
  lecturers,
}: {
  courses: CourseWithLecturer[];
  lecturers: User[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.lecturer.name.toLowerCase().includes(q)
    );
  }, [courses, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name, code, or lecturer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {courses.length === 0
            ? "No courses yet. Create the first one to get started."
            : "No courses match your search."}
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.code}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.lecturer.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <EditCourseDialog course={course} lecturers={lecturers} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
