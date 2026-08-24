"use client";

import { useActionState, useState } from "react";
import {
  publishCoursework,
  type PublishState,
} from "@/app/lecturer/coursework/actions";
import { Button } from "@/components/ui/button";
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

const initialState: PublishState = {};

// No success-close effect needed: the parent only renders this component
// while status === "DRAFT", so a successful publish's revalidation unmounts
// the trigger (and this dialog with it) automatically.
export function PublishCourseworkDialog({
  courseworkId,
  title,
}: {
  courseworkId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    publishCoursework,
    initialState
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish &quot;{title}&quot;?</DialogTitle>
          <DialogDescription>
            Assigned groups will immediately be able to see this coursework
            and submit work. You will no longer be able to edit its details.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="id" value={courseworkId} />
          {state.error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
