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
import { EditGroupDialog } from "@/components/admin/edit-group-dialog";
import type { Course, Group, User } from "@/lib/generated/prisma/client";

type GroupRow = Group & {
  course: Course;
  leader: User;
  _count: { members: number };
};

export function GroupsTable({
  groups,
  courses,
}: {
  groups: GroupRow[];
  courses: Course[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.course.name.toLowerCase().includes(q) ||
        g.leader.name.toLowerCase().includes(q)
    );
  }, [groups, search]);

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
          {groups.length === 0
            ? "No groups yet. Create the first one to get started."
            : "No groups match your search."}
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.course.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.leader.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group._count.members}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/admin/groups/${group.id}`} />}
                    >
                      View
                    </Button>
                    <EditGroupDialog group={group} courses={courses} />
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
