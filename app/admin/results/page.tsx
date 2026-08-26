import { format } from "date-fns";
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

// Admin can view all published results system-wide (business-logic.md §3.1),
// read-only -- publishing stays the owning lecturer's job.
export default async function AdminResultsPage() {
  await requireRole("ADMIN");

  const marks = await prisma.mark.findMany({
    where: { status: "PUBLISHED" },
    include: {
      submission: {
        include: { group: true, coursework: { include: { course: true, lecturer: true } } },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Results</h1>
        <p className="text-sm text-muted-foreground">
          Every published result across the whole system.
        </p>
      </div>

      {marks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No results have been published yet.
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Coursework</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Mark</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marks.map((mark) => (
                <TableRow key={mark.id}>
                  <TableCell className="font-medium">
                    {mark.submission.group.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mark.submission.coursework.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mark.submission.coursework.course.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mark.submission.coursework.lecturer.name}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {mark.awarded} / {mark.maxMarks}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mark.publishedAt
                      ? format(mark.publishedAt, "d MMM yyyy")
                      : "—"}
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
