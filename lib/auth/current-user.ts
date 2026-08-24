import { cache } from "react";
import { prisma } from "@/lib/db/client";
import { createClient } from "@/lib/auth/server";
import type { Role, User } from "@/lib/generated/prisma/client";

// cache() dedupes this within a single request -- layouts and pages in the
// same render pass both call it without triggering repeat auth/DB round-trips.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!dbUser || !dbUser.active) return null;

  return dbUser;
});

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "LECTURER":
      return "/lecturer";
    case "GROUP_LEADER":
      return "/leader";
  }
}
