import { requireRole } from "@/lib/auth/require-role";
import { PlaceholderDashboard } from "@/components/dashboard/placeholder-dashboard";

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");
  return <PlaceholderDashboard user={user} />;
}
