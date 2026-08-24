import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Shell for now -- active-coursework/awaiting-marking stats (design.md §17)
// land in Phase 8 once coursework and submissions exist to summarize.
export default async function LecturerDashboardPage() {
  const user = await requireRole("LECTURER");

  const courses = await prisma.course.findMany({
    where: { lecturerId: user.id },
    include: { _count: { select: { groups: true, courseworks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name}.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Your Courses
        </h2>
        {courses.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You are not assigned to any courses yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <p className="font-medium text-foreground">
                    {course.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {course.code}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {course._count.groups} group
                    {course._count.groups === 1 ? "" : "s"} &middot;{" "}
                    {course._count.courseworks} coursework
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" render={<Link href="/lecturer/coursework" />}>
        View Coursework
      </Button>
    </div>
  );
}
