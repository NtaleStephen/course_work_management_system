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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditLog, User } from "@/lib/generated/prisma/client";

type AuditLogRow = AuditLog & { user: User };

const TIME_WINDOWS = {
  all: { label: "All time", ms: null },
  today: { label: "Today", ms: 24 * 60 * 60 * 1000 },
  week: { label: "Last 7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  month: { label: "Last 30 days", ms: 30 * 24 * 60 * 60 * 1000 },
} as const;

type TimeWindow = keyof typeof TIME_WINDOWS;

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}

export function AuditLogsTable({ logs }: { logs: AuditLogRow[] }) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<string>("all");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");

  const actionOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.action))).sort();
    return unique;
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const windowMs = TIME_WINDOWS[timeWindow].ms;
    const cutoff = windowMs ? Date.now() - windowMs : null;

    return logs.filter((log) => {
      if (action !== "all" && log.action !== action) return false;
      if (cutoff && log.createdAt.getTime() < cutoff) return false;
      if (!q) return true;
      return (
        log.user.name.toLowerCase().includes(q) ||
        log.user.email.toLowerCase().includes(q) ||
        formatAction(log.action).includes(q) ||
        log.resourceType.toLowerCase().includes(q)
      );
    });
  }, [logs, search, action, timeWindow]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by user, action, or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={action} onValueChange={(v) => setAction(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actionOptions.map((a) => (
              <SelectItem key={a} value={a}>
                {formatAction(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={timeWindow}
          onValueChange={(v) => setTimeWindow(v as TimeWindow)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIME_WINDOWS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No activity matches your filters.
        </p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {log.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.user.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatAction(log.action)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.resourceType}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(log.createdAt, "d MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {log.metadata ? (
                      <details>
                        <summary className="cursor-pointer text-xs text-muted-foreground">
                          View
                        </summary>
                        <pre className="mt-1 overflow-x-auto text-xs text-muted-foreground">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
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
