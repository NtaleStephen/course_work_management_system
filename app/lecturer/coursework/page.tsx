import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import { CourseworkTable } from "@/components/lecturer/coursework-table";

export default async function LecturerCourseworkPage() {
  const user = await requireRole("LECTURER");

  const coursework = await prisma.coursework.findMany({
    where: { lecturerId: user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Coursework
          </h1>
          <p className="text-sm text-muted-foreground">
            Coursework you have created.
          </p>
        </div>
        <Button render={<Link href="/lecturer/coursework/new" />}>
          + Create Coursework
        </Button>
      </div>
      <CourseworkTable items={coursework} />
    </div>
  );
}
