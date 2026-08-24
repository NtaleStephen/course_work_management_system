import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Minimal shell for now -- deadlines/coursework-to-submit stats (design.md
// §32) land once coursework and submissions exist (Phase 4+/8).
export default async function LeaderDashboardPage() {
  const user = await requireRole("GROUP_LEADER");

  const group = await prisma.group.findUnique({
    where: { leaderId: user.id },
    include: { course: true, _count: { select: { members: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name}.
        </p>
      </div>

      {group ? (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {group.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {group.course.name} &middot; {group._count.members} member
                {group._count.members === 1 ? "" : "s"}
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/leader/group" />}>
              View Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          You are not currently assigned to lead a group.
        </p>
      )}
    </div>
  );
}
