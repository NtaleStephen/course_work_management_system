import { PdfViewer } from "@/components/lecturer/pdf-viewer";
import { DocxViewer } from "@/components/lecturer/docx-viewer";

// Single entry point that dispatches by mime type -- swapping either
// renderer only ever touches its own component (tech-stack.md §14/§59).
export function SubmissionDocumentViewer({
  url,
  mimeType,
}: {
  url: string;
  mimeType: string;
}) {
  if (mimeType === "application/pdf") {
    return <PdfViewer url={url} />;
  }
  return <DocxViewer url={url} />;
}
