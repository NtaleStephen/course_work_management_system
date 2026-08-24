import { requireRole } from "@/lib/auth/require-role";

export default async function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("GROUP_LEADER");
  return <>{children}</>;
}
