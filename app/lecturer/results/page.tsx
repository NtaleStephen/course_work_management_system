import { format } from "date-fns";
import { requireRole } from "@/lib/auth/require-role";
import { getLecturerSubmissionRows } from "@/lib/lecturer-submissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// business-logic.md §33's "Previous Results" -- a filter on the same
// underlying data as /lecturer/submissions, not a separate table.
export default async function LecturerResultsPage() {
  const user = await requireRole("LECTURER");

  const rows = await getLecturerSubmissionRows(user.id);
  const published = rows.filter(
    (row) => row.status === "RESULT_PUBLISHED" && row.submission?.mark
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Results</h1>
        <p className="text-sm text-muted-foreground">
          Published results across your coursework.
        </p>
      </div>

      {published.length === 0 ? (
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
                <TableHead>Mark</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {published.map((row) => (
                <TableRow key={`${row.courseworkId}-${row.groupId}`}>
                  <TableCell className="font-medium">
                    {row.groupName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.courseworkTitle}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.courseName}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {row.submission!.mark!.awarded} /{" "}
                    {row.submission!.mark!.maxMarks}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.submission!.mark!.publishedAt
                      ? format(
                          row.submission!.mark!.publishedAt,
                          "d MMM yyyy"
                        )
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
