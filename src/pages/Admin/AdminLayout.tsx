import React, { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeft,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MAIN_NAV: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/sets", label: "Test sets", icon: BookOpen },
  { to: "/admin/students", label: "Students", icon: Users },
]

function pageTitle(pathname: string): string {
  if (pathname === "/admin/sets/new") return "New test set"
  if (/\/admin\/sets\/\d+\/edit$/.test(pathname)) return "Edit test set"
  if (pathname.startsWith("/admin/test-builder/")) return "Test set builder"
  if (pathname.startsWith("/admin/sets")) return "Test sets"
  if (pathname.startsWith("/admin/students")) return "Students"
  return "Overview"
}

function navItemActive(pathname: string, to: string, end?: boolean) {
  if (to === "/admin" && end) return pathname === "/admin"
  if (to === "/admin/sets") return pathname.startsWith("/admin/sets")
  if (to === "/admin/students") return pathname.startsWith("/admin/students")
  return pathname === to
}

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = pageTitle(location.pathname)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50/80 text-slate-900">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "relative z-50 flex h-full flex-col border-r border-slate-200/90 bg-white shadow-sm transition-all duration-200 ease-out",
          "max-md:fixed max-md:inset-y-0 max-md:left-0",
          "md:static md:shrink-0",
          collapsed ? "w-[4.5rem]" : "w-60",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-slate-100 px-3",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-black text-slate-900">LetsCrack</p>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-slate-400">Admin</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
          {MAIN_NAV.map(({ to, label, icon: Icon, end }) => (
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
                  collapsed && "justify-center px-0"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-2.5">
          <div
            className={cn(
              "mb-2 rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2",
              collapsed && "hidden"
            )}
          >
            <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Build</p>
            <p className="text-[0.7rem] font-mono text-slate-500">v1.0</p>
          </div>
          <Button
            variant="ghost"
            className={cn("w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700", collapsed && "px-0 justify-center")}
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
          <PanelLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main column */}
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
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 md:text-lg">{title}</h1>
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

          <div className="flex items-center gap-3">
            <div className="hidden h-9 items-center gap-2 rounded-full border border-slate-100 bg-slate-50/80 pl-1 pr-3 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {user?.firstName?.charAt(0) ?? "A"}
              </div>
              <div className="max-w-[10rem] truncate text-left text-sm font-semibold text-slate-800">
                {user?.firstName} {user?.lastName}
              </div>
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
  )
}

export default AdminLayout
