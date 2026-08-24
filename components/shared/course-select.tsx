"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/lib/generated/prisma/client";

export function CourseSelect({
  courses,
  defaultValue,
  value,
  onValueChange,
  triggerId,
}: {
  courses: Course[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  triggerId?: string;
}) {
  // Select.Value needs Select.Root's items map to resolve a label from the
  // stored value -- see LecturerSelect for the same fix.
  const items = useMemo(
    () => Object.fromEntries(courses.map((c) => [c.id, c.name])),
    [courses]
  );

  return (
    <Select
      name="courseId"
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange ? (v) => v && onValueChange(v) : undefined}
      items={items}
    >
      <SelectTrigger id={triggerId} className="w-full">
        <SelectValue placeholder="Select a course" />
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
