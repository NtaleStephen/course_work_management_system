import { redirect } from "next/navigation";
import { getCurrentUser, dashboardPathForRole } from "@/lib/auth/current-user";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? dashboardPathForRole(user.role) : "/login");
}
