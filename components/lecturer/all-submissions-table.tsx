"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";
import type { DerivedSubmissionStatus } from "@/lib/submission-status";

export type AllSubmissionsRow = {
  key: string;
  courseworkTitle: string;
  courseName: string;
  groupName: string;
  status: DerivedSubmissionStatus;
  submissionId?: string;
};

export function AllSubmissionsTable({
  rows,
  emptyMessage = "No published coursework yet.",
}: {
  rows: AllSubmissionsRow[];
  emptyMessage?: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.groupName.toLowerCase().includes(q) ||
        r.courseworkTitle.toLowerCase().includes(q) ||
        r.courseName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by group, coursework, or course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {rows.length === 0 ? emptyMessage : "No submissions match your search."}
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Coursework</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell>
                    <SubmissionStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {!row.submissionId ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : row.status === "RESULT_PUBLISHED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link
                            href={`/lecturer/submissions/${row.submissionId}`}
                          />
                        }
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        render={<Link href={`/marking/${row.submissionId}`} />}
                      >
                        Mark
                      </Button>
                    )}
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
