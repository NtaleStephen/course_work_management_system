import { SidebarTrigger } from "@/components/ui/sidebar";

// design.md §14: "☰  CLASSWORK  🔔" -- compact, non-space-consuming mobile bar.
// Notification bell lands with the notifications feature; omitted for now.
export function MobileHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
      <SidebarTrigger />
      <span className="text-sm font-semibold text-foreground">Classwork</span>
    </header>
  );
}
