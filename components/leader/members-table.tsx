import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditMemberDialog } from "@/components/leader/edit-member-dialog";
import { RemoveMemberDialog } from "@/components/leader/remove-member-dialog";
import type { GroupMember } from "@/lib/generated/prisma/client";

export function MembersTable({ members }: { members: GroupMember[] }) {
  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No members yet. Add your first group member to get started.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Registration No.</TableHead>
            <TableHead>Course</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {member.registrationNumber}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.course}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <EditMemberDialog member={member} />
                <RemoveMemberDialog member={member} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
