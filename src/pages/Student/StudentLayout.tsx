import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  FileText,
  Activity,
  LogOut,
  Menu,
  PanelLeft,
} from "lucide-react";

const MAIN_NAV: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: "main" | "practice" | "reports";
  end?: boolean;
}[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "main", end: true },
  { to: "/dashboard/library", label: "Practice Library", icon: BookOpen, section: "practice" },
  { to: "/dashboard/activity", label: "Active Session", icon: Activity, section: "practice" },
  { to: "/dashboard/reports", label: "Results & Reports", icon: FileText, section: "reports" },
  { to: "/dashboard/progress", label: "Progress Analytics", icon: LineChart, section: "reports" },
  { to: "/dashboard/courses", label: "Courses", icon: BookOpen, section: "reports" },
];

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/library")) return "Practice library";
  if (pathname.startsWith("/dashboard/activity")) return "Active session";
  if (pathname.startsWith("/dashboard/reports")) return "Results & reports";
  if (pathname.startsWith("/dashboard/courses")) return "Courses";
  if (pathname.startsWith("/dashboard/progress")) return "Progress analytics";
  if (pathname.startsWith("/dashboard")) return "Student dashboard";
  return "Student dashboard";
}

function navItemActive(pathname: string, to: string, end?: boolean) {
  if (to === "/dashboard/courses")
    return pathname.startsWith("/dashboard/courses");
  if (to === "/dashboard/library")
    return pathname.startsWith("/dashboard/library");
  if (to === "/dashboard/activity")
    return pathname.startsWith("/dashboard/activity");
  if (to === "/dashboard/reports")
    return pathname.startsWith("/dashboard/reports");
  if (to === "/dashboard/progress")
    return pathname.startsWith("/dashboard/progress");
  if (to === "/dashboard" && end) return pathname === "/dashboard";
  return pathname === to;
}

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(Boolean(localStorage.getItem("activeSessionId")));

  const title = pageTitle(location.pathname);

  useEffect(() => {
    const refresh = () => setHasActiveSession(Boolean(localStorage.getItem("activeSessionId")));
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/80 text-slate-900">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "relative z-50 flex h-full flex-col border-r border-slate-200/90 bg-white shadow-sm transition-all duration-200 ease-out",
          "max-md:fixed max-md:inset-y-0 max-md:left-0",
          "md:static md:shrink-0",
          collapsed ? "w-18" : "w-60",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-slate-100 px-3",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-black text-slate-900">
                  LetsCrack
                </p>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Student
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto p-2.5">
          {(["main", "practice", "reports"] as const).map((section) => {
            const items = MAIN_NAV.filter((x) => x.section === section);
            const sectionLabel =
              section === "main" ? "Home" : section === "practice" ? "Practice" : "Reports";
            return (
              <div key={section} className="space-y-0.5">
                {!collapsed && (
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {sectionLabel}
                  </p>
                )}
                {items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    title={collapsed ? label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={() =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                        navItemActive(location.pathname, to, end)
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        collapsed && "justify-center px-0",
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {!collapsed && to === "/dashboard/activity" && hasActiveSession ? (
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Live
                      </span>
                    ) : null}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-2.5">
          <div
            className={cn(
              "mb-2 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2",
              collapsed && "hidden",
            )}
          >
            <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
              Profile
            </p>
            <p className="truncate text-[0.7rem] text-slate-600">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700",
              collapsed && "justify-center px-0",
            )}
            title="Sign out"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="font-semibold">Sign out</span>}
          </Button>
        </div>

        <button
          type="button"
          className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-primary md:flex"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/90 bg-white/90 px-4 shadow-sm backdrop-blur-sm md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 md:text-lg">
                {title}
              </h1>
              <p className="hidden text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 sm:block">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
