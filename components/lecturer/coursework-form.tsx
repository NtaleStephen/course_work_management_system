"use client";

import { useActionState, useState } from "react";
import {
  createCoursework,
  updateCoursework,
  type CourseworkFormState,
} from "@/app/lecturer/coursework/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseSelect } from "@/components/shared/course-select";
import { AssignGroupsChecklist } from "@/components/lecturer/assign-groups-checklist";
import type { Course, Coursework, Group } from "@/lib/generated/prisma/client";

const initialState: CourseworkFormState = {};

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CourseworkForm({
  courses,
  groups,
  coursework,
  assignedGroupIds,
}: {
  courses: Course[];
  groups: Group[];
  coursework?: Coursework;
  assignedGroupIds?: string[];
}) {
  const isEdit = Boolean(coursework);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateCoursework : createCoursework,
    initialState
  );
  const [courseId, setCourseId] = useState<string | undefined>(
    coursework?.courseId ?? courses[0]?.id
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {isEdit ? (
        <input type="hidden" name="id" value={coursework!.id} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={coursework?.title}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="courseId">Course</Label>
        <CourseSelect
          courses={courses}
          value={courseId}
          onValueChange={setCourseId}
          triggerId="courseId"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          name="instructions"
          rows={5}
          defaultValue={coursework?.instructions}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxMarks">Maximum Marks</Label>
          <Input
            id="maxMarks"
            name="maxMarks"
            type="number"
            min={1}
            step={1}
            defaultValue={coursework?.maxMarks}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={
              coursework ? toDatetimeLocalValue(coursework.deadline) : undefined
            }
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowLateSubmission"
          name="allowLateSubmission"
          defaultChecked={coursework?.allowLateSubmission}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="allowLateSubmission" className="font-normal">
          Allow late submissions
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Assign Groups</Label>
        <AssignGroupsChecklist
          groups={groups}
          courseId={courseId}
          defaultCheckedIds={assignedGroupIds}
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex gap-2">
        {isEdit ? (
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        ) : (
          <>
            <Button
              type="submit"
              name="intent"
              value="draft"
              variant="outline"
              disabled={pending}
            >
              {pending ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending}
            >
              {pending ? "Publishing..." : "Publish"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
