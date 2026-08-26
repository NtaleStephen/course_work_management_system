"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/client";
import { recordAudit } from "@/lib/audit/log";
import { changePasswordSchema } from "@/lib/validation/password";

export type ChangePasswordState = { error?: string; ok?: boolean };

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireRole("LECTURER");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();

  // Re-verify identity with the current password before allowing a change --
  // the password the admin shared out-of-band is a one-time credential, so
  // this confirms the lecturer actually knows it rather than trusting an
  // already-open session alone.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) {
    return { error: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (updateError) {
    return { error: "Unable to change your password. Please try again." };
  }

  await recordAudit(prisma, {
    userId: user.id,
    action: "CHANGE_PASSWORD",
    resourceType: "User",
    resourceId: user.id,
  });

  return { ok: true };
}
