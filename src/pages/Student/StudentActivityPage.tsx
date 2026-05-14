import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertCircle, ChevronRight } from "lucide-react";
import { getProgress, getResultStatus } from "../../services/test.service";
import type { ResultStatus } from "../../services/test.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

type ProgressAttempt = {
  setNumber: number;
  overallBand?: number | string;
  date: string;
  status?: string;
  isPending?: boolean;
};

const StudentActivityPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([]);
  const [status, setStatus] = useState<ResultStatus | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const activeSessionId = localStorage.getItem("activeSessionId");
  const activeTestSetNumber = localStorage.getItem("activeTestSetNumber");

  useEffect(() => {
    const run = async () => {
      try {
        setAttempts((await getProgress()) as ProgressAttempt[]);
        if (activeSessionId) {
          setStatus(await getResultStatus(activeSessionId));
        }
      } catch {
        setError("Could not load recent activity.");
      }
    };
    void run();
  }, [activeSessionId]);

  const recent = useMemo(() => attempts, [attempts]);

  return (
    <div className="space-y-4">
      <Card className="border border-slate-300 bg-white shadow-none">
        <CardHeader className="border-b border-slate-300 pb-3">
          <CardTitle className="inline-flex items-center gap-2 text-base font-black text-slate-900">
            <Activity className="h-4 w-4 text-slate-600" />
            Active Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sm">
          {activeSessionId ? (
            <>
              <p className="text-slate-700">Session {activeSessionId.slice(-8)} is currently active.</p>
              {status ? (
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <div>Writing: {status.progress.writing.submitted}/{status.progress.writing.total}</div>
                  <div>Speaking: {status.progress.speaking.submitted}/{status.progress.speaking.total}</div>
                  <div>Reading: {status.progress.reading.submitted}/{status.progress.reading.total}</div>
                  <div>Listening: {status.progress.listening.submitted}/{status.progress.listening.total}</div>
                </div>
              ) : null}
              <button
                onClick={() => activeTestSetNumber && navigate(`/test/setup/${activeTestSetNumber}`)}
                className="inline-flex items-center gap-2 border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800"
              >
                Continue Session <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <p className="text-slate-600">No active session right now.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-300 bg-white shadow-none">
        <CardHeader className="border-b border-slate-300 pb-3">
          <CardTitle className="text-base font-black text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          {error ? (
            <div className="flex items-start gap-2 border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          ) : recent.length ? (
            recent.map((attempt) => (
              <div key={`${attempt.setNumber}-${attempt.date}`} className="flex items-center justify-between border border-slate-300 bg-slate-50 p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900">Test Set #{attempt.setNumber}</p>
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
            <p className="text-sm text-slate-500">No recent activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentActivityPage;
