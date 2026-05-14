import React, { useEffect, useMemo, useState } from "react"
import { getProgress } from "@/services/test.service"
import { AlertCircle, BarChart3, CheckCircle2, Target, TrendingUp } from "lucide-react"

type ProgressAttempt = {
  setNumber: number
  writingBand?: number | string
  speakingBand?: number | string
  readingBand?: number | string
  listeningBand?: number | string
  overallBand?: number | string
  date: string
}

const toNum = (value: number | string | undefined) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const avg = (values: Array<number | null>) => {
  const clean = values.filter((v): v is number => v != null)
  if (!clean.length) return null
  return clean.reduce((a, b) => a + b, 0) / clean.length
}

const StudentStatsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const data = (await getProgress()) as ProgressAttempt[]
        setAttempts(data)
        setError("")
      } catch {
        setError("Could not load stats right now.")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [])

  const summary = useMemo(() => {
    const overall = attempts.map((a) => toNum(a.overallBand))
    const writing = attempts.map((a) => toNum(a.writingBand))
    const speaking = attempts.map((a) => toNum(a.speakingBand))
    const reading = attempts.map((a) => toNum(a.readingBand))
    const listening = attempts.map((a) => toNum(a.listeningBand))
    const overallAvg = avg(overall)
    const latest = overall[0] ?? null
    const previous = overall[1] ?? null
    return {
      testsTaken: attempts.length,
      overallAvg,
      improvement: latest != null && previous != null ? latest - previous : null,
      moduleAverages: [
        { key: "writing", label: "Writing", value: avg(writing), tone: "text-blue-700 bg-blue-50" },
        { key: "speaking", label: "Speaking", value: avg(speaking), tone: "text-violet-700 bg-violet-50" },
        { key: "reading", label: "Reading", value: avg(reading), tone: "text-emerald-700 bg-emerald-50" },
        { key: "listening", label: "Listening", value: avg(listening), tone: "text-amber-700 bg-amber-50" },
      ],
      trend: attempts
        .slice(0, 6)
        .reverse()
        .map((a) => ({
          label: `Set ${a.setNumber}`,
          band: toNum(a.overallBand) ?? 0,
          date: new Date(a.date).toLocaleDateString(),
        })),
    }
  }, [attempts])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-slate-500">Loading stats...</div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Performance hub</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Student stats</h2>
        <p className="mt-2 text-sm text-slate-500">
          This page turns your attempts into progress insights: average score, module strengths, and recent trend.
        </p>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Tests taken</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{summary.testsTaken}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Average overall band</p>
          <p className="mt-1 text-3xl font-black text-blue-700">
            {summary.overallAvg != null ? summary.overallAvg.toFixed(1) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Last change</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-black text-emerald-700">
            <TrendingUp className="h-5 w-5" />
            {summary.improvement != null ? `${summary.improvement >= 0 ? "+" : ""}${summary.improvement.toFixed(1)}` : "—"}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-500" />
            <h3 className="text-lg font-black text-slate-900">Module averages</h3>
          </div>
          <div className="space-y-3">
            {summary.moduleAverages.map((m) => (
              <div key={m.key} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${m.tone}`}>
                  {m.value != null ? m.value.toFixed(1) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <h3 className="text-lg font-black text-slate-900">Recent trend (last 6 attempts)</h3>
          </div>
          {!summary.trend.length ? (
            <p className="text-sm text-slate-500">No attempts yet.</p>
          ) : (
            <div className="space-y-2">
              {summary.trend.map((point) => (
                <div key={`${point.label}-${point.date}`} className="grid grid-cols-[90px_1fr_52px] items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">{point.label}</span>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.max(4, Math.min(100, (point.band / 12) * 100))}%` }}
                    />
                  </div>
                  <span className="text-right text-xs font-black text-slate-700">{point.band || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <h3 className="text-lg font-black text-slate-900">How it works</h3>
        </div>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>- Stats update whenever a new attempt appears in your progress history.</li>
          <li>- Module averages use all graded attempts available from your current account.</li>
          <li>- Trend chart shows recent momentum so students can spot improvement or decline quickly.</li>
          <li>- Next step: add weak-skill recommendations (e.g., "Focus on listening this week").</li>
        </ul>
      </section>
    </div>
  )
}

export default StudentStatsPage
