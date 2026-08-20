import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Car,
  Repeat2,
  Users,
  Receipt,
  Wallet,
  UserCog,
  BadgeDollarSign,
  Settings,
  ScrollText,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/lib/image-url";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Cars", url: "/cars", icon: Car },
  { title: "Sales", url: "/sales", icon: BadgeDollarSign },
  { title: "Exchanges", url: "/exchanges", icon: Repeat2 },
  { title: "Dealers", url: "/dealers", icon: Users },
];

const money = [
  { title: "Billing", url: "/billing", icon: Receipt },
  { title: "Expenses", url: "/expenses", icon: Wallet },
];

const team = [
  { title: "Employees", url: "/employees", icon: UserCog },
  { title: "Salaries", url: "/salaries", icon: BadgeDollarSign },
  { title: "Activity Logs", url: "/logs", icon: ScrollText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const bargainName = user?.["bargainName"];
  const logoUrl = getImageUrl(user?.logo) || undefined;
  const initials = bargainName
    ? bargainName
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : undefined;

  const section = (label: string, items: typeof main) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Logo
          title={bargainName}
          subtitle="Car Bargain Manager"
          initials={initials}
          imageUrl={logoUrl}
        />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {section("Main", main)}
        {section("Money", money)}
        {section("Team", team)}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => {
                logout();
                navigate({ to: "/auth/signin" });
              }}
              className="flex items-center gap-3"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
