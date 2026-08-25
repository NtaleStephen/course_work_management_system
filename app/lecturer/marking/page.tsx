import { requireRole } from "@/lib/auth/require-role";
import {
  AllSubmissionsTable,
  type AllSubmissionsRow,
} from "@/components/lecturer/all-submissions-table";
import { getLecturerSubmissionRows } from "@/lib/lecturer-submissions";

export default async function LecturerMarkingQueuePage() {
  const user = await requireRole("LECTURER");

  const rows = await getLecturerSubmissionRows(user.id);

  // The queue is "who still needs marking attention" (design.md §67
  // Priority 2) -- unsubmitted groups and published results have nothing
  // left for the lecturer to do here.
  const tableRows: AllSubmissionsRow[] = rows
    .filter(
      (row) => row.submission && row.status !== "RESULT_PUBLISHED"
    )
    .map((row) => ({
      key: `${row.courseworkId}-${row.groupId}`,
      courseworkTitle: row.courseworkTitle,
      courseName: row.courseName,
      groupName: row.groupName,
      status: row.status,
      submissionId: row.submission!.id,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Marking</h1>
        <p className="text-sm text-muted-foreground">
          Submissions still awaiting a mark or a published result.
        </p>
      </div>
      <AllSubmissionsTable
        rows={tableRows}
        emptyMessage="Nothing needs marking right now."
      />
    </div>
  );
}
