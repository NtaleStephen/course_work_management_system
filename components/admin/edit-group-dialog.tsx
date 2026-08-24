"use client";

import { useActionState, useEffect, useState } from "react";
import { updateGroup, type UpdateGroupState } from "@/app/admin/groups/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseSelect } from "@/components/shared/course-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Course, Group } from "@/lib/generated/prisma/client";

const initialState: UpdateGroupState = {};

export function EditGroupDialog({
  group,
  courses,
}: {
  group: Group;
  courses: Course[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateGroup,
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
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the group name or reassign its course.
          </DialogDescription>
        </DialogHeader>
        <form
          key={`${group.id}-${group.updatedAt.toISOString()}`}
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={group.id} />
          <div className="space-y-2">
            <Label htmlFor={`name-${group.id}`}>Group Name</Label>
            <Input
              id={`name-${group.id}`}
              name="name"
              defaultValue={group.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`courseId-${group.id}`}>Course</Label>
            <CourseSelect
              courses={courses}
              defaultValue={group.courseId}
              triggerId={`courseId-${group.id}`}
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
