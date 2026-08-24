import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/db/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      course: true,
      leader: true,
      members: { orderBy: { name: "asc" } },
    },
  });

  if (!group) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {group.name}
        </h1>
        <p className="text-sm text-muted-foreground">{group.course.name}</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Group Leader</p>
        <p className="text-base font-medium text-foreground">
          {group.leader.name}
        </p>
        <p className="text-sm text-muted-foreground">{group.leader.email}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Members
        </h2>
        {group.members.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No members yet. The group leader can add members once they sign
            in.
          </p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration No.</TableHead>
                  <TableHead>Course</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.registrationNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.course}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
