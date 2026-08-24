"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import type { Group } from "@/lib/generated/prisma/client";

export function AssignGroupsChecklist({
  groups,
  courseId,
  defaultCheckedIds,
}: {
  groups: Group[];
  courseId: string | undefined;
  defaultCheckedIds?: string[];
}) {
  const groupsForCourse = useMemo(
    () => groups.filter((g) => g.courseId === courseId),
    [groups, courseId]
  );

  if (!courseId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a course to see its groups.
      </p>
    );
  }

  if (groupsForCourse.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This course has no groups yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {groupsForCourse.map((group) => (
        <div key={group.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`group-${group.id}`}
            name="groupIds"
            value={group.id}
            defaultChecked={defaultCheckedIds?.includes(group.id)}
            className="size-4 rounded border-input"
          />
          <Label htmlFor={`group-${group.id}`} className="font-normal">
            {group.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
