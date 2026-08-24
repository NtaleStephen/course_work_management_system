import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Read-only -- business-logic.md §4: lecturers view assigned courses, they
// don't create or edit them (that's an admin capability, §3.1).
export default async function LecturerCoursesPage() {
  const user = await requireRole("LECTURER");

  const courses = await prisma.course.findMany({
    where: { lecturerId: user.id },
    include: { _count: { select: { groups: true, courseworks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
        <p className="text-sm text-muted-foreground">
          Courses assigned to you.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You are not assigned to any courses yet.
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead>Coursework</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course.code}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course._count.groups}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {course._count.courseworks}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
