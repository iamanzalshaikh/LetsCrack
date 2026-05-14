import React, { useEffect, useMemo, useState } from "react";
import { getProgress } from "@/services/test.service";
import { LineChart, Trophy } from "lucide-react";

type ProgressAttempt = {
  setNumber: number;
  overallBand?: number | string;
  date: string;
};

const StudentProgressPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const data = (await getProgress()) as ProgressAttempt[];
        setAttempts(data);
        setError("");
      } catch {
        setError(
          "Too many requests right now. Please wait a few seconds and refresh.",
        );
      }
    };
    void run();
  }, []);

  const trend = useMemo(
    () =>
      attempts
        .slice(0, 8)
        .reverse()
        .map((a) => ({
          label: `S${a.setNumber}`,
          value: Number.isFinite(Number(a.overallBand))
            ? Number(a.overallBand)
            : 0,
          date: new Date(a.date).toLocaleDateString(),
        })),
    [attempts],
  );

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Progress
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your learning momentum in one place. This will later include
          personalized recommendations and targets.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <LineChart className="h-4 w-4 text-slate-500" />
          <h3 className="text-lg font-black text-slate-900">Overall trend</h3>
        </div>
        {!trend.length ? (
          <p className="text-sm text-slate-500">No attempts yet.</p>
        ) : (
          <div className="space-y-2">
            {trend.map((t) => (
              <div
                key={`${t.label}-${t.date}`}
                className="grid grid-cols-[52px_1fr_50px] items-center gap-3"
              >
                <span className="text-xs font-semibold text-slate-500">
                  {t.label}
                </span>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{
                      width: `${Math.max(4, Math.min(100, (t.value / 12) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-right text-xs font-black text-slate-700">
                  {t.value || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-600" />
          <h3 className="text-lg font-black text-slate-900">
            Next improvement goals
          </h3>
        </div>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>- Attempt at least 2 mock tests per week.</li>
          <li>- Focus extra practice on your lowest module.</li>
          <li>- Target +0.5 band in the next 30 days.</li>
        </ul>
      </section>
    </div>
  );
};

export default StudentProgressPage;
