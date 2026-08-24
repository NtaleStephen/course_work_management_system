"use client";

import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import type { Coursework, Course } from "@/lib/generated/prisma/client";

type CourseworkRow = Coursework & { course: Course };

function statusBadge(coursework: Coursework) {
  if (coursework.status === "DRAFT") {
    return <Badge variant="secondary">Draft</Badge>;
  }
  if (coursework.deadline.getTime() < Date.now()) {
    return <Badge variant="secondary">Closed</Badge>;
  }
  return (
    <Badge className="border-green-200 bg-green-50 text-green-700">
      Active
    </Badge>
  );
}

export function CourseworkTable({ items }: { items: CourseworkRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.course.name.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title or course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "No coursework yet. Create your first coursework assignment to get started."
            : "No coursework matches your search."}
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coursework</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/lecturer/coursework/${item.id}`}
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.course.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(item.deadline, "d MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell>{statusBadge(item)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
