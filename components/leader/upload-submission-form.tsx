"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, X } from "lucide-react";
import {
  uploadSubmission,
  type UploadSubmissionState,
} from "@/app/leader/coursework/[id]/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: UploadSubmissionState = {};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Depend on the whole state object (not state.ok) -- useActionState
  // returns a new object on every dispatch, so this fires on every
  // successful submission, including back-to-back replacements where
  // `ok` stays `true` and wouldn't otherwise be seen as "changed".
  useEffect(() => {
    if (state.ok) {
      toast.success("Submission uploaded successfully.");
      formRef.current?.reset();
      setSelectedFile(null);
    }
  }, [state]);

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="courseworkId" value={courseworkId} />

      <div className="rounded-lg border-2 border-dashed border-input p-8 text-center">
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="size-16 text-primary" strokeWidth={1.5} />
            <p className="max-w-full truncate text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="mt-1"
            >
              <X className="size-4" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-1 text-sm text-muted-foreground">
              Upload your work
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              PDF or Word document, up to 20MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="hidden"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
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
