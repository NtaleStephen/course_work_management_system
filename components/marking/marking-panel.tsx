"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  saveMark,
  publishResult,
  type MarkActionState,
} from "@/app/marking/[submissionId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: MarkActionState = {};

export function MarkingPanel({
  submissionId,
  groupName,
  maxMarks,
  existingMark,
}: {
  submissionId: string;
  groupName: string;
  maxMarks: number;
  existingMark: { awarded: number; feedback: string | null; status: "SAVED" | "PUBLISHED" } | null;
}) {
  const [saveState, saveAction, savePending] = useActionState(
    saveMark,
    initialState
  );
  const [publishState, publishAction, publishPending] = useActionState(
    publishResult,
    initialState
  );
  const [publishOpen, setPublishOpen] = useState(false);

  // Controlled, seeded once from the initial props -- a background router
  // refresh (triggered by the save/publish actions' revalidatePath) must
  // never clobber marks the lecturer is mid-typing.
  const [awarded, setAwarded] = useState(
    existingMark ? String(existingMark.awarded) : ""
  );
  const [feedback, setFeedback] = useState(existingMark?.feedback ?? "");

  const isPublished = existingMark?.status === "PUBLISHED";

  useEffect(() => {
    if (saveState.ok) {
      toast.success("Mark saved successfully.");
    }
  }, [saveState]);

  useEffect(() => {
    if (publishState.ok) {
      toast.success("Result published successfully.");
      setPublishOpen(false);
    }
  }, [publishState]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Marking
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          {groupName}
        </h2>
      </div>

      <form action={saveAction} className="flex flex-1 flex-col gap-4">
        <input type="hidden" name="submissionId" value={submissionId} />

        <div className="space-y-1.5">
          <Label htmlFor="awarded">Marks</Label>
          <div className="flex items-center gap-2">
            <Input
              id="awarded"
              name="awarded"
              type="number"
              min={0}
              max={maxMarks}
              step={1}
              value={awarded}
              onChange={(e) => setAwarded(e.target.value)}
              className="w-24"
              required
            />
            <span className="text-sm text-muted-foreground">
              / {maxMarks}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-1.5">
          <Label htmlFor="feedback">Feedback</Label>
          <Textarea
            id="feedback"
            name="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-32 flex-1"
            placeholder="Feedback for the group..."
          />
        </div>

        {saveState.error ? (
          <Alert variant="destructive">
            <AlertDescription>{saveState.error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" disabled={savePending}>
          {savePending ? "Saving..." : "Save Mark"}
        </Button>
      </form>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" disabled={!existingMark || isPublished}>
              {isPublished ? "Result Published" : "Publish Result"}
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish this result?</DialogTitle>
            <DialogDescription>
              {groupName} will immediately be able to see the mark and
              feedback. This cannot be undone from here.
            </DialogDescription>
          </DialogHeader>
          <form action={publishAction}>
            <input type="hidden" name="submissionId" value={submissionId} />
            {publishState.error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{publishState.error}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={publishPending}>
                {publishPending ? "Publishing..." : "Publish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
