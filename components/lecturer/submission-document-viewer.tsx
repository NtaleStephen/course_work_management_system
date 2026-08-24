import { PdfViewer } from "@/components/lecturer/pdf-viewer";
import { DocxViewer } from "@/components/lecturer/docx-viewer";

// Single entry point that dispatches by mime type -- swapping either
// renderer only ever touches its own component (tech-stack.md §14/§59).
export function SubmissionDocumentViewer({
  url,
  mimeType,
  className,
}: {
  url: string;
  mimeType: string;
  className?: string;
}) {
  if (mimeType === "application/pdf") {
    return <PdfViewer url={url} className={className} />;
  }
  return <DocxViewer url={url} className={className} />;
}
