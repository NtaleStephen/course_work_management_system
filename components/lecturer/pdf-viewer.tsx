// Browsers render embedded PDFs natively with their own toolbar (page nav,
// zoom, fullscreen, search) -- no PDF.js integration needed for MVP
// (design.md §28, tech-stack.md §14).
export function PdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      title="Submission document"
      className="h-[80vh] w-full rounded-lg border border-border"
    />
  );
}
