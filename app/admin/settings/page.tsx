import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";

// No system-wide configurable settings are specified anywhere in the
// project docs yet -- this intentionally shows only real data (the admin's
// own account) rather than inventing toggles with nothing behind them.
export default async function AdminSettingsPage() {
  const admin = await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your administrator account.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium text-foreground">
              {admin.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">
              {admin.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="text-sm font-medium text-foreground">
              Administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
