import { requireRole } from "@/lib/auth/require-role";
import { PlaceholderDashboard } from "@/components/dashboard/placeholder-dashboard";

export default async function LecturerDashboardPage() {
  const user = await requireRole("LECTURER");
  return <PlaceholderDashboard user={user} />;
}
