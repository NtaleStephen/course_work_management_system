import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/generated/prisma/client";

// Stand-in dashboard for the Phase 1 auth/role smoke test. Each role's real
// dashboard (stats, coursework, etc.) is built out in later phases.
export function PlaceholderDashboard({ user }: { user: User }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="text-lg font-semibold text-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">
          {user.email} &middot; {user.role}
        </p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </div>
  );
}
