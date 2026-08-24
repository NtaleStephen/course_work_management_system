"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/lib/generated/prisma/client";

export function LecturerSelect({
  lecturers,
  defaultValue,
  triggerId,
}: {
  lecturers: User[];
  defaultValue?: string;
  triggerId?: string;
}) {
  // Select.Value shows the raw value unless Select.Root is given an items
  // map -- it doesn't infer labels from SelectItem children automatically.
  const items = useMemo(
    () => Object.fromEntries(lecturers.map((l) => [l.id, l.name])),
    [lecturers]
  );

  return (
    <Select name="lecturerId" defaultValue={defaultValue} items={items}>
      <SelectTrigger id={triggerId} className="w-full">
        <SelectValue placeholder="Select a lecturer" />
      </SelectTrigger>
      <SelectContent>
        {lecturers.map((lecturer) => (
          <SelectItem key={lecturer.id} value={lecturer.id}>
            {lecturer.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
