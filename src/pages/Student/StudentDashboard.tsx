import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  getAvailableTests,
  getProgress,
  getResultStatus,
} from "../../services/test.service";
import type { ResultStatus, TestSet } from "../../services/test.service";
import {
  Award,
  CalendarDays,
  BookOpen,
  Play,
  ChevronRight,
  Loader2,
  AlertCircle,
  Flame,
  Target,
  WandSparkles,
  BrainCircuit,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  connectGradingSocket,
  disconnectGradingSocket,
} from "../../services/gradingSocket.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface ProgressAttempt {
  setNumber: number;
  writingBand?: number | string;
  speakingBand?: number | string;
  readingBand?: number | string;
  listeningBand?: number | string;
  overallBand?: number | string;
  date: string;
  status?: string;
  isPending?: boolean;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [progress, setProgress] = useState<ProgressAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    localStorage.getItem("activeSessionId"),
  );
  const [activeTestSetNumber, setActiveTestSetNumber] = useState<string | null>(
    localStorage.getItem("activeTestSetNumber"),
  );
  const [status, setStatus] = useState<ResultStatus | null>(null);
  const [statusError, setStatusError] = useState("");

  const refreshStatus = useCallback(async (sessionId: string) => {
    try {
      const latest = await getResultStatus(sessionId);
      setStatus(latest);
      setStatusError("");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response
          ?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : "Could not load grading status";
      setStatusError(message || "Could not load grading status");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [availableTests, history] = await Promise.all([
          getAvailableTests(),
          getProgress(),
        ]);
        setTestSets(availableTests);
        setProgress(history);
      } catch {
        setStatusError("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    const timeout = window.setTimeout(() => refreshStatus(activeSessionId), 0);
    const interval = window.setInterval(
      () => refreshStatus(activeSessionId),
      8000,
    );
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [activeSessionId, refreshStatus]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !activeSessionId) return;

    const listeners = {
      onQueued: (payload: { sessionId: string }) => {
        if (payload.sessionId === activeSessionId)
          refreshStatus(payload.sessionId);
      },
      onUpdated: (payload: { sessionId: string; status?: string }) => {
        if (payload.sessionId !== activeSessionId) return;
        refreshStatus(payload.sessionId);
        if (payload.status === "graded") {
          localStorage.removeItem("activeSessionId");
          localStorage.removeItem("activeTestSetNumber");
          setActiveSessionId(null);
          setActiveTestSetNumber(null);
        }
      },
      onFailed: (payload: { sessionId: string; message?: string }) => {
        if (payload.sessionId === activeSessionId) {
          setStatusError(payload.message || "AI grading retry in progress.");
          refreshStatus(payload.sessionId);
        }
      },
    };

    connectGradingSocket(token, listeners);
    return () => disconnectGradingSocket(listeners);
  }, [activeSessionId, refreshStatus]);

  const statusTone = useMemo(() => {
    if (!status)
      return {
        label: "No active session",
        classes: "bg-slate-100 text-slate-600",
      };
    if (status.status === "graded")
      return { label: "Graded", classes: "bg-emerald-50 text-emerald-700" };
    if (status.status === "grading")
      return { label: "AI Grading", classes: "bg-blue-50 text-blue-700" };
    if (status.status === "submitted")
      return { label: "Submitted", classes: "bg-indigo-50 text-indigo-700" };
    return { label: "In Progress", classes: "bg-amber-50 text-amber-700" };
  }, [status]);

  const parsedBandList = useMemo(() => {
    return progress
      .map((attempt) => Number(attempt.overallBand ?? attempt.writingBand ?? 0))
      .filter((val) => Number.isFinite(val) && val > 0);
  }, [progress]);

  const moduleAverages = useMemo(() => {
    const mean = (values: Array<number | null>) => {
      const clean = values.filter((v): v is number => v != null);
      if (!clean.length) return null;
      return clean.reduce((sum, v) => sum + v, 0) / clean.length;
    };
    const n = (value: number | string | undefined) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    return [
      {
        key: "writing",
        label: "Writing",
        value: mean(progress.map((a) => n(a.writingBand))),
        tone: "bg-blue-50 text-blue-700",
      },
      {
        key: "speaking",
        label: "Speaking",
        value: mean(progress.map((a) => n(a.speakingBand))),
        tone: "bg-violet-50 text-violet-700",
      },
      {
        key: "reading",
        label: "Reading",
        value: mean(progress.map((a) => n(a.readingBand))),
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        key: "listening",
        label: "Listening",
        value: mean(progress.map((a) => n(a.listeningBand))),
        tone: "bg-amber-50 text-amber-700",
      },
    ];
  }, [progress]);

  const stats = useMemo(() => {
    const avgBand =
      parsedBandList.length > 0
        ? (
            parsedBandList.reduce((sum, val) => sum + val, 0) /
            parsedBandList.length
          ).toFixed(1)
        : "—";
    const bestBand =
      parsedBandList.length > 0 ? Math.max(...parsedBandList).toFixed(1) : "—";
    const days = Array.from(
      new Set(progress.map((a) => new Date(a.date).toISOString().slice(0, 10))),
    ).sort((a, b) => (a > b ? -1 : 1));
    let streak = 0;
    for (let i = 0; i < days.length; i++) {
      const dt = new Date(days[i]);
      dt.setDate(dt.getDate() - i);
      const check = dt.toISOString().slice(0, 10);
      if (check === days[i]) streak += 1;
      else break;
    }
    return {
      testsTaken: progress.length,
      avgBand,
      bestBand,
      streakDays: streak,
    };
  }, [parsedBandList, progress]);

  const recentAttempts = useMemo(() => progress.slice(0, 10), [progress]);

  const handleStartTest = (setNumber: number) => {
    navigate(`/test/setup/${setNumber}`);
  };

  const handleContinueSession = () => {
    if (!activeSessionId || !activeTestSetNumber) return;
    navigate(`/test/setup/${activeTestSetNumber}`);
  };

  return (
    <div className="space-y-5 text-slate-900">
      <Card className="border border-slate-300 bg-white shadow-none">
        <CardContent className="space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Student Dashboard
              </p>
              <h2 className="text-2xl font-black text-slate-900">
                Welcome back, {user?.firstName || "Learner"}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
              <CalendarDays className="h-4 w-4" />
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                testSets[0] && handleStartTest(testSets[0].testSetNumber)
              }
              disabled={!testSets.length}
              className="inline-flex items-center gap-2 border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
            >
              Start Full Mock <Play className="h-3.5 w-3.5 fill-current" />
            </button>
            <button
              onClick={handleContinueSession}
              disabled={!activeSessionId || !activeTestSetNumber}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Continue Session <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tests Taken",
            value: stats.testsTaken,
            tone: "text-slate-900",
            icon: null,
          },
          {
            label: "Average Band",
            value: stats.avgBand,
            tone: "text-blue-600",
            icon: null,
          },
          {
            label: "Best Band",
            value: stats.bestBand,
            tone: "text-emerald-700",
            icon: <Award className="h-4 w-4" />,
          },
          {
            label: "Streak (days)",
            value: stats.streakDays,
            tone: "text-orange-600",
            icon: <Flame className="h-4 w-4" />,
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="border border-slate-300 bg-white shadow-none"
          >
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {item.label}
              </p>
              <div
                className={`mt-2 flex items-center gap-2 text-3xl font-black ${item.tone}`}
              >
                {item.icon}
                <span>{item.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border border-slate-300 bg-white shadow-none">
        <CardHeader className="border-b border-slate-300 pb-3">
          <CardTitle className="inline-flex items-center gap-2 text-base font-black text-slate-900">
            <Target className="h-4 w-4 text-slate-600" />
            Module Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 lg:grid-cols-4">
          {moduleAverages.map((m) => {
            const pct =
              m.value != null
                ? Math.max(4, Math.min(100, (m.value / 12) * 100))
                : 0;
            return (
              <div key={m.key} className="border border-slate-300 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">{m.label}</p>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black ${m.tone}`}
                  >
                    {m.value != null ? m.value.toFixed(1) : "—"}
                  </span>
                </div>
                <div className="h-2 bg-slate-100">
                  <div
                    className="h-2 bg-slate-900"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="border border-slate-300 bg-white shadow-none lg:col-span-8">
          <CardHeader className="border-b border-slate-300 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-black text-slate-900">
                Recent Activity
              </CardTitle>
              <button
                onClick={() => navigate("/dashboard/progress")}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {recentAttempts.length > 0 ? (
              recentAttempts.map((attempt) => (
                <div
                  key={`${attempt.setNumber}-${attempt.date}`}
                  className="flex items-center justify-between border border-slate-300 bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-blue-200 bg-blue-50 text-sm font-black text-blue-700">
                      {attempt.overallBand || "—"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-900">
                          Test Set #{attempt.setNumber}
                        </p>
                        {attempt.isPending && (
                          <span className="bg-amber-50 text-amber-700 text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider border border-amber-200">
                            Grading
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(attempt.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/results/${attempt.setNumber}`)}
                    disabled={attempt.isPending}
                    className="inline-flex items-center gap-1 border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attempt.isPending ? "Processing" : "Open"} <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <WandSparkles className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                <p className="text-sm font-semibold text-slate-500">
                  No attempts yet. Start your first test.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-4">
          <Card className="border border-slate-300 bg-white shadow-none">
            <CardHeader className="border-b border-slate-300 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black text-slate-900">
                  Live Grading
                </CardTitle>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${statusTone.classes}`}
                >
                  {statusTone.label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-4 text-xs text-slate-600">
              <p>
                {activeSessionId
                  ? `Session ${activeSessionId.slice(-8)} is being tracked.`
                  : "No active session right now."}
              </p>
              {status ? (
                <div className="space-y-1 font-semibold text-slate-700">
                  <div>
                    Writing: {status.progress.writing.graded}/
                    {status.progress.writing.total}
                  </div>
                  <div>
                    Speaking: {status.progress.speaking.graded}/
                    {status.progress.speaking.total}
                  </div>
                  <div>
                    Reading: {status.progress.reading.graded}/
                    {status.progress.reading.total}
                  </div>
                  <div>
                    Listening: {status.progress.listening.graded}/
                    {status.progress.listening.total}
                  </div>
                </div>
              ) : null}
              {statusError ? (
                <div className="flex items-start gap-2 border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-800">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {statusError}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border border-slate-300 bg-white shadow-none">
            <CardHeader className="border-b border-slate-300 pb-3">
              <CardTitle className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
                <BrainCircuit className="h-4 w-4 text-slate-600" />
                Quick Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="inline-flex items-start gap-2">
                  <ListChecks className="mt-0.5 h-3.5 w-3.5 text-blue-600" />
                  Practice one timed writing task daily.
                </li>
                <li className="inline-flex items-start gap-2">
                  <ListChecks className="mt-0.5 h-3.5 w-3.5 text-violet-600" />
                  Use simulation mode once every 3 attempts.
                </li>
                <li className="inline-flex items-start gap-2">
                  <ListChecks className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                  Review AI corrections before next set.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border border-slate-300 bg-white shadow-none">
        <CardHeader className="border-b border-slate-300 pb-3">
          <CardTitle className="text-base font-black text-slate-900">
            Practice Library
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            testSets.map((test) => (
              <div
                key={test.testSetNumber}
                className="border border-slate-300 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center border border-blue-200 bg-blue-50">
                    <BookOpen className="h-4 w-4 text-blue-700" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700 bg-violet-50 border border-violet-200">
                    Set {test.testSetNumber}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {test.title}
                </h3>
                <p className="mt-1 min-h-10 text-xs text-slate-600">
                  {test.description}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-slate-500">
                  Estimated: {test.estimatedTime}
                </p>
                <button
                  onClick={() => handleStartTest(test.testSetNumber)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-slate-800 bg-slate-900 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800"
                >
                  Start Test <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
