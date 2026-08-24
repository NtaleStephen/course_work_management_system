import { requireRole } from "@/lib/auth/require-role";
import { PlaceholderDashboard } from "@/components/dashboard/placeholder-dashboard";

export default async function LeaderDashboardPage() {
  const user = await requireRole("GROUP_LEADER");
  return <PlaceholderDashboard user={user} />;
}
