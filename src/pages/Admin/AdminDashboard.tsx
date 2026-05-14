import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getTestSets,
  getAllUsers,
  deleteUser,
  getRetentionReport,
} from "../../services/admin.service";
import {
  Trash2,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  LayoutDashboard,
  Users,
  Clock,
  BookOpen,
  FileEdit,
  UserCog,
  TrendingUp,
  CreditCard,
  Layers3,
  LineChart,
  ArrowUpRight,
} from "lucide-react";
import ChartBarMixed from "@/components/Admin/ChartBarMixed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Section = "overview" | "students";

const AdminDashboard: React.FC = () => {
  const { pathname } = useLocation();
  const section: Section = useMemo(() => {
    if (pathname.includes("/students")) return "students";
    return "overview";
  }, [pathname]);

  const [users, setUsers] = useState<unknown[]>([]);
  const [testSets, setTestSets] = useState<unknown[]>([]);
  const [retention, setRetention] = useState<{
    metrics?: { pendingPurge?: number; totalPurged?: number };
  } | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  const loadOverview = async () => {
    setIsLoadingOverview(true);
    try {
      const [u, ts, r] = await Promise.all([
        getAllUsers(),
        getTestSets(),
        getRetentionReport(),
      ]);
      setUsers(u);
      setTestSets(ts);
      setRetention(r);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (section !== "overview") return;
    const t = window.setTimeout(() => {
      void loadOverview();
    }, 0);
    return () => window.clearTimeout(t);
  }, [section]);

  const [studentList, setStudentList] = useState<
    {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    }[]
  >([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try {
      setStudentList((await getAllUsers("user")) as typeof studentList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (section !== "students") return;
    const t = window.setTimeout(() => {
      void loadStudents();
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when section / route changes only
  }, [section]);

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      loadStudents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || "Failed");
    }
  };

  const studentCount = users.filter(
    (u) => (u as { role?: string }).role === "user",
  ).length;
  const adminCount = users.filter(
    (u) => (u as { role?: string }).role === "admin",
  ).length;

  const { publishedCount, draftCount } = useMemo(() => {
    let pub = 0;
    for (const t of testSets as { status?: string }[]) {
      if (t.status === "published") pub += 1;
    }
    return { publishedCount: pub, draftCount: testSets.length - pub };
  }, [testSets]);

  const businessKpis = useMemo(
    () => [
      {
        key: "subscriptions",
        label: "Active subscriptions",
        value: studentCount,
        hint: "Temporary: mapped to active learners",
        icon: CreditCard,
        tone: "text-blue-700",
        box: "bg-blue-500/10 text-blue-600 border-blue-500/10",
      },
      {
        key: "courses",
        label: "Published courses",
        value: publishedCount,
        hint: "Temporary: mapped to published test sets",
        icon: Layers3,
        tone: "text-violet-700",
        box: "bg-violet-500/10 text-violet-600 border-violet-500/10",
      },
      {
        key: "growth",
        label: "Growth score",
        value: `${Math.max(0, Math.min(100, Math.round((publishedCount / Math.max(1, testSets.length)) * 100)))}%`,
        hint: "Temporary: publish ratio this cycle",
        icon: TrendingUp,
        tone: "text-emerald-700",
        box: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
      },
    ],
    [studentCount, publishedCount, testSets.length],
  );

  const barSnapshot = useMemo(
    () => [
      {
        label: "Now",
        learners: studentCount,
        testSets: testSets.length,
        published: publishedCount,
      },
    ],
    [studentCount, testSets.length, publishedCount],
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* ── OVERVIEW ── */}
      {section === "overview" && (
        <>
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Control center
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                    Business dashboard
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Clean snapshot of subscriptions, courses, and growth
                    metrics. Values are wired to current platform data now, and
                    can be replaced with dedicated APIs later without changing
                    the layout.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {businessKpis.map((kpi) => (
                    <div
                      key={kpi.key}
                      className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[0.62rem] font-bold uppercase tracking-widest text-muted-foreground">
                          {kpi.label}
                        </p>
                        <kpi.icon className={cn("h-4 w-4", kpi.tone)} />
                      </div>
                      <p
                        className={cn(
                          "mt-1 text-2xl font-black tabular-nums leading-none",
                          kpi.tone,
                        )}
                      >
                        {kpi.value}
                      </p>
                      <p className="mt-1 text-[0.7rem] font-medium text-muted-foreground">
                        {kpi.hint}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Platform overview
              </h2>
              <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/admin/sets"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "inline-flex gap-1.5 rounded-xl shadow-sm",
                )}
              >
                <BookOpen className="h-4 w-4" />
                Test sets
              </Link>
              <Link
                to="/admin/sets/new"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "inline-flex gap-1.5 rounded-xl",
                )}
              >
                <FileEdit className="h-4 w-4" />
                New set
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadOverview}
                className="gap-1.5 text-muted-foreground"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Row 1 — stat cards (shadcn + skeletons) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoadingOverview
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Card
                    key={i}
                    className="overflow-hidden border-border shadow-sm"
                  >
                    <CardContent className="space-y-3 p-5">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </CardContent>
                  </Card>
                ))
              : [
                  {
                    k: "Learners",
                    v: studentCount,
                    hint: "Student role",
                    icon: Users,
                    tone: "text-emerald-600",
                    box: "bg-emerald-500/10 text-emerald-600 border-emerald-500/10",
                  },
                  {
                    k: "Test sets",
                    v: testSets.length,
                    hint: "All definitions",
                    icon: LayoutDashboard,
                    tone: "text-slate-700",
                    box: "bg-slate-500/10 text-slate-600 border-slate-500/10",
                  },
                  {
                    k: "Published",
                    v: publishedCount,
                    hint: "Live for students",
                    icon: CheckCircle2,
                    tone: "text-primary",
                    box: "bg-primary/10 text-primary border-primary/10",
                  },
                  {
                    k: "Draft",
                    v: draftCount,
                    hint: "Unpublished",
                    icon: BookOpen,
                    tone: "text-amber-700",
                    box: "bg-amber-500/10 text-amber-600 border-amber-500/10",
                  },
                  {
                    k: "Admins",
                    v: adminCount,
                    hint: "Staff logins",
                    icon: UserCog,
                    tone: "text-violet-700",
                    box: "bg-violet-500/10 text-violet-600 border-violet-500/10",
                  },
                ].map((c) => (
                  <Card
                    key={c.k}
                    className="group relative overflow-hidden border-border shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                            {c.k}
                          </p>
                          <p
                            className={cn(
                              "text-2xl font-black tabular-nums leading-none",
                              c.tone,
                            )}
                          >
                            {c.v}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                            c.box,
                          )}
                        >
                          <c.icon className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">
                        {c.hint}
                      </p>
                      <c.icon
                        className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-16 opacity-[0.04] transition-transform group-hover:scale-110"
                        strokeWidth={1}
                      />
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Row 2 — chart + retention */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ChartBarMixed data={barSnapshot} loading={isLoadingOverview} />
            </div>
            <Card className="border-border shadow-sm xl:min-h-0">
              <CardHeader>
                <CardTitle className="text-base font-bold">Retention</CardTitle>
                <CardDescription>
                  Automated session lifecycle (purge worker)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOverview ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : retention?.metrics ? (
                  <div className="space-y-3">
                    {[
                      {
                        k: "Pending purge",
                        v: retention.metrics.pendingPurge,
                        icon: Clock,
                      },
                      {
                        k: "Total purged (all time)",
                        v: retention.metrics.totalPurged,
                        icon: CheckCircle2,
                      },
                    ].map((x) => (
                      <div
                        key={x.k}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/30 px-4 py-3"
                      >
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                            {x.k}
                          </p>
                          <p className="text-2xl font-black tabular-nums text-foreground">
                            {x.v ?? "—"}
                          </p>
                        </div>
                        <x.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No retention metrics from the API yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  Subscriptions
                </CardTitle>
                <CardDescription>
                  Billing and plan metrics (phase 2)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Now
                  </p>
                  <p className="mt-1 text-xl font-black text-foreground">
                    {studentCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use this card for active paid users after API hookup.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  Connect subscription API <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Courses</CardTitle>
                <CardDescription>
                  Catalog health and completion (phase 2)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                    Published
                  </p>
                  <p className="mt-1 text-xl font-black text-foreground">
                    {publishedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Replace with real course count when course module is live.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  Connect course API <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  Growth (3rd metric)
                </CardTitle>
                <CardDescription>Recommended executive KPI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Publish ratio
                    </p>
                    <LineChart className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-1 text-xl font-black text-emerald-700">
                    {Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          (publishedCount / Math.max(1, testSets.length)) * 100,
                        ),
                      ),
                    )}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Later replace this with MRR growth or monthly active
                    learners.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  Connect growth API <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ── STUDENTS ── */}
      {section === "students" && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Learner accounts on the platform.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadStudents}
              className="gap-2 text-slate-500"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Card className="border-slate-200/80 shadow-sm">
            <div className="overflow-x-auto">
              {isLoadingStudents ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <table className="w-full min-w-[400px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                      {["Name", "Email", "Role", "Action"].map((h) => (
                        <th key={h} className="px-6 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentList.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-6 py-3.5 font-medium text-slate-800">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {s.email}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-slate-600">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteUser(
                                s._id,
                                `${s.firstName} ${s.lastName}`,
                              )
                            }
                            className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {studentList.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          No students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
