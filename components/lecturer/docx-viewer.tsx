"use client";

import { useEffect, useState } from "react";
import mammoth from "mammoth";
import DOMPurify from "dompurify";
import { Skeleton } from "@/components/ui/skeleton";

// Client-side .docx -> HTML conversion, isolated in its own component so the
// rendering approach can be swapped later (tech-stack.md §14/§59) without
// touching the rest of the marking flow.
export function DocxViewer({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        // The source .docx is student-uploaded content -- sanitize before
        // rendering, since a crafted hyperlink field could otherwise survive
        // mammoth's conversion into the HTML we hand to dangerouslySetInnerHTML.
        const safeHtml = DOMPurify.sanitize(result.value);
        if (!cancelled) setHtml(safeHtml);
      } catch {
        if (!cancelled) setError("Unable to render this document.");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (html === null) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  return (
    <div
      className="h-[80vh] overflow-y-auto rounded-lg border border-border bg-card p-6 text-sm text-foreground [&_em]:italic [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
