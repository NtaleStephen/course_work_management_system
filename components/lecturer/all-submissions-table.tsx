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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AllSubmissionsRow = {
  key: string;
  courseworkTitle: string;
  courseName: string;
  groupName: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "LATE";
  submissionId?: string;
};

function statusBadge(status: AllSubmissionsRow["status"]) {
  if (status === "NOT_SUBMITTED") {
    return <Badge variant="secondary">Not Submitted</Badge>;
  }
  if (status === "LATE") {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700">
        Late
      </Badge>
    );
  }
  return (
    <Badge className="border-green-200 bg-green-50 text-green-700">
      Submitted
    </Badge>
  );
}

export function AllSubmissionsTable({ rows }: { rows: AllSubmissionsRow[] }) {
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
                  <TableCell>{statusBadge(row.status)}</TableCell>
                  <TableCell className="text-right">
                    {row.submissionId ? (
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
                      <span className="text-sm text-muted-foreground">—</span>
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
