import { requireRole } from "@/lib/auth/require-role";
import {
  AllSubmissionsTable,
  type AllSubmissionsRow,
} from "@/components/lecturer/all-submissions-table";
import { getLecturerSubmissionRows } from "@/lib/lecturer-submissions";

export default async function LecturerSubmissionsPage() {
  const user = await requireRole("LECTURER");

  const rows = await getLecturerSubmissionRows(user.id);

  const tableRows: AllSubmissionsRow[] = rows.map((row) => ({
    key: `${row.courseworkId}-${row.groupId}`,
    courseworkTitle: row.courseworkTitle,
    courseName: row.courseName,
    groupName: row.groupName,
    status: row.status,
    submissionId: row.submission?.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Submissions
        </h1>
        <p className="text-sm text-muted-foreground">
          Every group&apos;s submission status across your published coursework.
        </p>
      </div>
      <AllSubmissionsTable rows={tableRows} />
    </div>
  );
}
