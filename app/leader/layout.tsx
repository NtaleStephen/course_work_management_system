import { requireRole } from "@/lib/auth/require-role";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";

export default async function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("GROUP_LEADER");

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} userName={user.name} userEmail={user.email} />
      <SidebarInset>
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
