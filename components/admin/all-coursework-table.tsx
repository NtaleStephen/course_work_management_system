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
import { CourseworkStatusBadge } from "@/components/shared/coursework-status-badge";
import { deriveCourseworkStatus } from "@/lib/coursework-status";

export type AdminCourseworkRow = {
  id: string;
  title: string;
  courseName: string;
  lecturerName: string;
  deadline: Date;
  status: "DRAFT" | "PUBLISHED";
};

export function AllCourseworkTable({ items }: { items: AdminCourseworkRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.lecturerName.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title, course, or lecturer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "No coursework has been created yet."
            : "No coursework matches your search."}
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coursework</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.courseName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lecturerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(item.deadline, "d MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <CourseworkStatusBadge
                      status={deriveCourseworkStatus(item)}
                    />
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
