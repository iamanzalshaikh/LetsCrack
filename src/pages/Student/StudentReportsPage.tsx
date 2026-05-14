import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { downloadAiEvaluationPdf, getProgress } from "../../services/test.service";
import { useAuthStore } from "../../store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

type ProgressAttempt = {
  setNumber: number;
  overallBand?: number | string;
  date: string;
};

const StudentReportsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([]);
  const [downloadingSet, setDownloadingSet] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const activeSessionId = localStorage.getItem("activeSessionId");

  useEffect(() => {
    const run = async () => {
      setAttempts((await getProgress()) as ProgressAttempt[]);
    };
    void run();
  }, []);

  return (
    <Card className="border border-slate-300 bg-white shadow-none">
      <CardHeader className="border-b border-slate-300 pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-base font-black text-slate-900">
          <FileText className="h-4 w-4 text-slate-600" />
          Results, Reports and AI PDFs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {!attempts.length ? (
          <p className="text-sm text-slate-500">No reports yet. Complete a test to see results.</p>
        ) : (
          attempts.slice(0, 12).map((attempt) => (
            <div key={`${attempt.setNumber}-${attempt.date}`} className="flex flex-wrap items-center justify-between gap-2 border border-slate-300 bg-slate-50 p-3">
              <div>
                <p className="text-sm font-black text-slate-900">Set #{attempt.setNumber}</p>
                <p className="text-xs text-slate-500">
                  {new Date(attempt.date).toLocaleDateString()} · Overall {attempt.overallBand ?? "—"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/results/${attempt.setNumber}`)}
                  className="border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
                >
                  Open Result
                </button>
                <button
                  onClick={async () => {
                    setDownloadingSet(attempt.setNumber);
                    try {
                      await downloadAiEvaluationPdf(
                        attempt.setNumber,
                        `${user?.firstName || "Student"}_${user?.lastName || ""}`.trim(),
                        activeSessionId
                      );
                    } finally {
                      setDownloadingSet(null);
                    }
                  }}
                  className="inline-flex items-center gap-1 border border-blue-300 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-800 hover:bg-blue-100"
                >
                  <Download className="h-3 w-3" />
                  {downloadingSet === attempt.setNumber ? "Preparing..." : "AI PDF"}
                </button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default StudentReportsPage;
