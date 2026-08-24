"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { deriveSubmissionStatus } from "@/lib/submission-status";
import { SubmissionStatusBadge } from "@/components/shared/submission-status-badge";

export type GroupSubmissionRow = {
  groupId: string;
  groupName: string;
  submission: {
    id: string;
    status: "SUBMITTED" | "LATE";
    submittedAt: Date;
    mark: { status: "SAVED" | "PUBLISHED" } | null;
  } | null;
};

type FilterKey = "all" | "submitted" | "awaiting_mark" | "late" | "not_submitted";

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={cn(
        "cursor-pointer transition-colors",
        active && "border-primary ring-1 ring-primary"
      )}
    >
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export function SubmissionOverview({ rows }: { rows: GroupSubmissionRow[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = {
    submitted: rows.filter((r) => r.submission?.status === "SUBMITTED").length,
    awaiting_mark: rows.filter((r) => r.submission && !r.submission.mark)
      .length,
    late: rows.filter((r) => r.submission?.status === "LATE").length,
    not_submitted: rows.filter((r) => !r.submission).length,
  };

  const filtered = rows.filter((row) => {
    switch (filter) {
      case "submitted":
        return row.submission?.status === "SUBMITTED";
      case "awaiting_mark":
        return row.submission && !row.submission.mark;
      case "late":
        return row.submission?.status === "LATE";
      case "not_submitted":
        return !row.submission;
      default:
        return true;
    }
  });

  function toggle(key: FilterKey) {
    setFilter((current) => (current === key ? "all" : key));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Submitted"
          value={counts.submitted}
          active={filter === "submitted"}
          onClick={() => toggle("submitted")}
        />
        <StatCard
          label="Awaiting Mark"
          value={counts.awaiting_mark}
          active={filter === "awaiting_mark"}
          onClick={() => toggle("awaiting_mark")}
        />
        <StatCard
          label="Late"
          value={counts.late}
          active={filter === "late"}
          onClick={() => toggle("late")}
        />
        <StatCard
          label="Not Submitted"
          value={counts.not_submitted}
          active={filter === "not_submitted"}
          onClick={() => toggle("not_submitted")}
        />
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => {
              const status = deriveSubmissionStatus(row);
              return (
                <TableRow key={row.groupId}>
                  <TableCell className="font-medium">
                    {row.groupName}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.submission
                      ? format(row.submission.submittedAt, "d MMM yyyy, HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!row.submission ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : status === "RESULT_PUBLISHED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link
                            href={`/lecturer/submissions/${row.submission.id}`}
                          />
                        }
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        render={
                          <Link href={`/marking/${row.submission.id}`} />
                        }
                      >
                        Mark
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
