import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/lecturer/change-password-form";

export default async function LecturerSettingsPage() {
  const user = await requireRole("LECTURER");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your account and password.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium text-foreground">
              {user.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Change Password
        </h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
