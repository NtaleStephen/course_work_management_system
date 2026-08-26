"use client";

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

export type LecturerGroupRow = {
  id: string;
  name: string;
  courseName: string;
  leaderName: string;
  memberCount: number;
};

export function LecturerGroupsTable({ groups }: { groups: LecturerGroupRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.courseName.toLowerCase().includes(q) ||
        g.leaderName.toLowerCase().includes(q)
    );
  }, [groups, search]);

  if (groups.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No groups yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by group, course, or leader..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No groups match your search.
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Group Leader</TableHead>
                <TableHead>Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.courseName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.leaderName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.memberCount}
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
