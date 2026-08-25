import { Skeleton } from "@/components/ui/skeleton";

// Shared shell for stat-card-led pages (dashboards) -- design.md §51 wants
// skeleton loaders for major content areas instead of a blank screen while
// a Server Component's data fetch is in flight.
export function DashboardSkeleton({
  statCount = 4,
  cardCount = 3,
}: {
  statCount?: number;
  cardCount?: number;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}
