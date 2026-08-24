import { redirect } from "next/navigation";
import { getCurrentUser, dashboardPathForRole } from "@/lib/auth/current-user";
import type { Role, User } from "@/lib/generated/prisma/client";

// Route-group gate: is there a logged-in user, and are they the right role
// for this section. Resource-level ownership checks (can this lecturer touch
// this specific course/coursework/submission) live in lib/permissions instead.
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect(dashboardPathForRole(user.role));
  }

  return user;
}
