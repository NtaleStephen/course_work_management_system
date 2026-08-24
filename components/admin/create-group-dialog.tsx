"use client";

import { useActionState, useState } from "react";
import { createGroup, type CreateGroupState } from "@/app/admin/groups/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import type { Course } from "@/lib/generated/prisma/client";

const initialState: CreateGroupState = {};

export function CreateGroupDialog({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createGroup,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Create Group</Button>} />
      <DialogContent>
        {state.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Group created</DialogTitle>
              <DialogDescription>
                Share these credentials with {state.success.leaderEmail}. The
                password will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1 rounded-md border border-border bg-muted p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Email: </span>
                {state.success.leaderEmail}
              </p>
              <p>
                <span className="text-muted-foreground">Password: </span>
                <span className="font-mono">{state.success.password}</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
              <DialogDescription>
                Creates the group and a login for its group leader.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseId">Course</Label>
                <CourseSelect courses={courses} triggerId="courseId" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="leaderName">Group Leader Name</Label>
                <Input id="leaderName" name="leaderName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaderEmail">Group Leader Email</Label>
                <Input
                  id="leaderEmail"
                  name="leaderEmail"
                  type="email"
                  required
                />
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
