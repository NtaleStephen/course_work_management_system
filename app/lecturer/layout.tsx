import { requireRole } from "@/lib/auth/require-role";

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("LECTURER");
  return <>{children}</>;
}
