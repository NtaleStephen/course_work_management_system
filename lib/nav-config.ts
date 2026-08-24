import {
  Home,
  BookOpen,
  Users,
  IdCard,
  FileText,
  Upload,
  Award,
  ScrollText,
  Settings,
  GraduationCap,
  CheckSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

// Order and icon choices follow design.md §12/§33/§45 and the icon mapping
// in §57 (filling in the handful design.md left unspecified: Lecturers,
// Users, Audit Logs, My Group).
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: Home, exact: true },
  { label: "Lecturers", href: "/admin/lecturers", icon: GraduationCap },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Groups", href: "/admin/groups", icon: Users },
  { label: "Users", href: "/admin/users", icon: IdCard },
  { label: "Coursework", href: "/admin/coursework", icon: FileText },
  { label: "Submissions", href: "/admin/submissions", icon: Upload },
  { label: "Results", href: "/admin/results", icon: Award },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const LECTURER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/lecturer", icon: Home, exact: true },
  { label: "Courses", href: "/lecturer/courses", icon: BookOpen },
  { label: "Coursework", href: "/lecturer/coursework", icon: FileText },
  { label: "Submissions", href: "/lecturer/submissions", icon: Upload },
  { label: "Marking", href: "/lecturer/marking", icon: CheckSquare },
  { label: "Results", href: "/lecturer/results", icon: Award },
  { label: "Groups", href: "/lecturer/groups", icon: Users },
];

export const LEADER_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/leader", icon: Home, exact: true },
  { label: "My Group", href: "/leader/group", icon: Users },
  { label: "Coursework", href: "/leader/coursework", icon: FileText },
  { label: "Results", href: "/leader/results", icon: Award },
];

export const NAV_ITEMS_BY_ROLE = {
  ADMIN: ADMIN_NAV_ITEMS,
  LECTURER: LECTURER_NAV_ITEMS,
  GROUP_LEADER: LEADER_NAV_ITEMS,
} as const;
