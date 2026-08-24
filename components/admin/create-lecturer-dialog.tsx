"use client";

import { useActionState, useState } from "react";
import {
  createLecturer,
  type CreateLecturerState,
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

const initialState: CreateLecturerState = {};

export function CreateLecturerDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createLecturer,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Create Lecturer</Button>} />
      <DialogContent>
        {state.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Lecturer created</DialogTitle>
              <DialogDescription>
                Share these credentials with {state.success.email}. The
                password will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1 rounded-md border border-border bg-muted p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Email: </span>
                {state.success.email}
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
              <DialogTitle>Create Lecturer</DialogTitle>
              <DialogDescription>
                Creates a login for the lecturer. Share the generated
                password with them manually.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
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
