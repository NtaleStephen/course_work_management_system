"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import type { DerivedSubmissionStatus } from "@/lib/submission-status";

export type AdminSubmissionRow = {
  key: string;
  groupName: string;
  courseworkTitle: string;
  courseName: string;
  lecturerName: string;
  status: DerivedSubmissionStatus;
  submittedAt: Date | null;
};

export function AdminSubmissionsTable({
  rows,
}: {
  rows: AdminSubmissionRow[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.groupName.toLowerCase().includes(q) ||
        r.courseworkTitle.toLowerCase().includes(q) ||
        r.courseName.toLowerCase().includes(q) ||
        r.lecturerName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by group, coursework, course, or lecturer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {rows.length === 0
            ? "No published coursework yet."
            : "No submissions match your search."}
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
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">
                    {row.groupName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.courseworkTitle}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.courseName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.lecturerName}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.submittedAt
                      ? format(row.submittedAt, "d MMM yyyy, HH:mm")
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
