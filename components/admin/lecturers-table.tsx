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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditLecturerDialog } from "@/components/admin/edit-lecturer-dialog";
import { setLecturerActive } from "@/app/admin/lecturers/actions";
import type { User } from "@/lib/generated/prisma/client";

export function LecturersTable({ lecturers }: { lecturers: User[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
    );
  }, [lecturers, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {lecturers.length === 0
            ? "No lecturers yet. Create the first one to get started."
            : "No lecturers match your search."}
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lecturer) => (
                <TableRow key={lecturer.id}>
                  <TableCell className="font-medium">
                    {lecturer.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lecturer.email}
                  </TableCell>
                  <TableCell>
                    {lecturer.active ? (
                      <Badge className="border-green-200 bg-green-50 text-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <EditLecturerDialog lecturer={lecturer} />
                    <form action={setLecturerActive}>
                      <input type="hidden" name="id" value={lecturer.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={(!lecturer.active).toString()}
                      />
                      <Button
                        type="submit"
                        variant={lecturer.active ? "destructive" : "outline"}
                        size="sm"
                      >
                        {lecturer.active ? "Disable" : "Enable"}
                      </Button>
                    </form>
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
