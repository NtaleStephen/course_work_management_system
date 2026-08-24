"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateCourse,
  type UpdateCourseState,
} from "@/app/admin/courses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LecturerSelect } from "@/components/admin/lecturer-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Course, User } from "@/lib/generated/prisma/client";

const initialState: UpdateCourseState = {};

export function EditCourseDialog({
  course,
  lecturers,
}: {
  course: Course;
  lecturers: User[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateCourse,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Edit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the course details or reassign its lecturer.
          </DialogDescription>
        </DialogHeader>
        <form
          key={`${course.id}-${course.updatedAt.toISOString()}`}
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={course.id} />
          <div className="space-y-2">
            <Label htmlFor={`name-${course.id}`}>Course Name</Label>
            <Input
              id={`name-${course.id}`}
              name="name"
              defaultValue={course.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`code-${course.id}`}>Course Code</Label>
            <Input
              id={`code-${course.id}`}
              name="code"
              defaultValue={course.code}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`lecturerId-${course.id}`}>Lecturer</Label>
            <LecturerSelect
              lecturers={lecturers}
              defaultValue={course.lecturerId}
              triggerId={`lecturerId-${course.id}`}
            />
          </div>
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
