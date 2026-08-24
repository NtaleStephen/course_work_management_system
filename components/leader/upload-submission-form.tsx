"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  uploadSubmission,
  type UploadSubmissionState,
} from "@/app/leader/coursework/[id]/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: UploadSubmissionState = {};

export function UploadSubmissionForm({
  courseworkId,
}: {
  courseworkId: string;
}) {
  const [state, formAction, pending] = useActionState(
    uploadSubmission,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Depend on the whole state object (not state.ok) -- useActionState
  // returns a new object on every dispatch, so this fires on every
  // successful submission, including back-to-back replacements where
  // `ok` stays `true` and wouldn't otherwise be seen as "changed".
  useEffect(() => {
    if (state.ok) {
      toast.success("Submission uploaded successfully.");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="courseworkId" value={courseworkId} />
      <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
        <p className="mb-1 text-sm text-muted-foreground">
          Upload your work
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          PDF or Word document, up to 20MB
        </p>
        <input
          type="file"
          name="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="mx-auto block text-sm text-foreground"
        />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
