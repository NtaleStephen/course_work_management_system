"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createCourse,
  type CreateCourseState,
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
import type { User } from "@/lib/generated/prisma/client";

const initialState: CreateCourseState = {};

export function CreateCourseDialog({ lecturers }: { lecturers: User[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createCourse,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
    }
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Create Course</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>
            Add a course and assign the lecturer responsible for it.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" name="code" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lecturerId">Lecturer</Label>
            <LecturerSelect lecturers={lecturers} triggerId="lecturerId" />
          </div>
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
