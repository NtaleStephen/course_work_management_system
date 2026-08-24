"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/client";
import { loginSchema } from "@/lib/validation/auth";
import { dashboardPathForRole } from "@/lib/auth/current-user";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: data.user.id } });

  if (!dbUser || !dbUser.active) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to sign in." };
  }

  redirect(dashboardPathForRole(dbUser.role));
}
