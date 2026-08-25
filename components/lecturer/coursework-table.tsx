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
import { Button } from "@/components/ui/button";
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

type TimeFilter = "all" | "current" | "past";

function isPast(item: Coursework) {
  return item.status === "PUBLISHED" && item.deadline.getTime() < Date.now();
}

export function CourseworkTable({ items }: { items: CourseworkRow[] }) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (timeFilter === "current" && isPast(c)) return false;
      if (timeFilter === "past" && !isPast(c)) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.course.name.toLowerCase().includes(q)
      );
    });
  }, [items, search, timeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search by title or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1">
          {(
            [
              ["all", "All"],
              ["current", "Current"],
              ["past", "Past"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={timeFilter === key ? "default" : "outline"}
              onClick={() => setTimeFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

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
