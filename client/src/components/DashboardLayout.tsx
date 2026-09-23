import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Award, BarChart3, CalendarDays, Flame, LayoutDashboard, LogOut, Menu, Settings, Target, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import LandingPage from "@/pages/LandingPage";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Target, label: "Goals", path: "/goals" },
  { icon: CalendarDays, label: "Journey", path: "/calendar" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Award, label: "Achievements", path: "/achievements" },
  { icon: UserRound, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <LandingPage />;
  return <SidebarProvider style={{ "--sidebar-width": "250px" } as React.CSSProperties}><DashboardLayoutContent>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const active = menuItems.find(item => item.path === location);
  return <>
    <Sidebar collapsible="icon" className="border-r border-white/[.07] bg-[#0b0e16] text-white">
      <SidebarHeader className="h-[76px] justify-center border-b border-white/[.06] px-3"><div className="flex items-center gap-3"><button onClick={toggleSidebar} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#d9ff3e] text-[#0b0d12] transition-transform active:scale-95" aria-label="Toggle navigation"><Flame className="size-4" /></button>{!collapsed && <div><p className="font-display text-sm font-bold tracking-[.16em] text-white">RISE90</p><p className="text-[10px] uppercase tracking-[.2em] text-[#d9ff3e]">Personal growth OS</p></div>}</div></SidebarHeader>
      <SidebarContent className="gap-0 px-2 py-5">{!collapsed && <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/30">Your journey</p>}<SidebarMenu className="gap-1">{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 rounded-xl px-3 text-white/55 transition-all hover:bg-white/[.05] hover:text-white data-[active=true]:bg-[#d9ff3e] data-[active=true]:font-medium data-[active=true]:text-[#0b0d12]"><item.icon className="size-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent>
      <SidebarFooter className="border-t border-white/[.06] p-3"><div className="flex items-center gap-2 rounded-xl p-1.5 group-data-[collapsible=icon]:justify-center"><Avatar className="size-8 shrink-0"><AvatarFallback className="bg-white/[.08] text-xs text-white">{user?.name?.charAt(0).toUpperCase() ?? "R"}</AvatarFallback></Avatar>{!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-white">{user?.name || "Your workspace"}</p><button onClick={logout} className="mt-0.5 flex items-center gap-1 text-[11px] text-white/35 hover:text-white"><LogOut className="size-3" /> Sign out</button></div>}</div></SidebarFooter>
    </Sidebar>
    <SidebarInset>
      {isMobile && <div className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-white/[.06] bg-[#0b0d12]/90 px-5 backdrop-blur-xl"><div><p className="text-[10px] font-medium uppercase tracking-[.16em] text-[#d9ff3e]">Rise90</p><p className="mt-0.5 font-display text-lg font-bold text-white">{active?.label ?? "Dashboard"}</p></div><SidebarTrigger className="grid size-10 place-items-center rounded-xl bg-white/[.06] text-white"><Menu className="size-4" /></SidebarTrigger></div>}
      <main className="min-h-screen flex-1 pb-24 lg:pb-8">{children}</main>
    </SidebarInset>
    {isMobile && <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/[.08] bg-[#141823]/90 p-1.5 shadow-2xl backdrop-blur-xl">{menuItems.slice(0, 5).map(item => <button key={item.path} onClick={() => setLocation(item.path)} className={`grid h-12 place-items-center rounded-xl transition ${location === item.path ? "bg-[#d9ff3e] text-[#0b0d12]" : "text-white/45"}`} aria-label={item.label}><item.icon className="size-4" /></button>)}</nav>}
  </>;
}
