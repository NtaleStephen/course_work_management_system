"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateLecturer,
  type UpdateLecturerState,
} from "@/app/admin/lecturers/actions";
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
import type { User } from "@/lib/generated/prisma/client";

const initialState: UpdateLecturerState = {};

export function EditLecturerDialog({ lecturer }: { lecturer: User }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateLecturer,
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
          <DialogTitle>Edit Lecturer</DialogTitle>
          <DialogDescription>
            Update this lecturer&apos;s name or email.
          </DialogDescription>
        </DialogHeader>
        <form
          key={`${lecturer.id}-${lecturer.updatedAt.toISOString()}`}
          action={formAction}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={lecturer.id} />
          <div className="space-y-2">
            <Label htmlFor={`name-${lecturer.id}`}>Name</Label>
            <Input
              id={`name-${lecturer.id}`}
              name="name"
              defaultValue={lecturer.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`email-${lecturer.id}`}>Email</Label>
            <Input
              id={`email-${lecturer.id}`}
              name="email"
              type="email"
              defaultValue={lecturer.email}
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
