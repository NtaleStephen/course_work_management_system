"use client";

import { useActionState, useEffect, useState } from "react";
import { updateMember, type UpdateMemberState } from "@/app/leader/group/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GroupMember } from "@/lib/generated/prisma/client";

const initialState: UpdateMemberState = {};

export function EditMemberDialog({ member }: { member: GroupMember }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateMember,
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
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update this member&apos;s information.
          </DialogDescription>
        </DialogHeader>
        <form
          key={`${member.id}-${member.updatedAt.toISOString()}`}
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={member.id} />
          <div className="space-y-2">
            <Label htmlFor={`name-${member.id}`}>Name</Label>
            <Input
              id={`name-${member.id}`}
              name="name"
              defaultValue={member.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`reg-${member.id}`}>Registration Number</Label>
            <Input
              id={`reg-${member.id}`}
              name="registrationNumber"
              defaultValue={member.registrationNumber}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`course-${member.id}`}>Course</Label>
            <Input
              id={`course-${member.id}`}
              name="course"
              defaultValue={member.course}
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
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
