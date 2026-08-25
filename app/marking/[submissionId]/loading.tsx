import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex-[7] border-r border-border p-4">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-[3] space-y-4 p-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
