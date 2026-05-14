import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { getAvailableTests } from "../../services/test.service";
import type { TestSet } from "../../services/test.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const StudentPracticeLibraryPage: React.FC = () => {
  const [tests, setTests] = useState<TestSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        setTests(await getAvailableTests());
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, []);

  return (
    <Card className="border border-slate-300 bg-white shadow-none">
      <CardHeader className="border-b border-slate-300 pb-3">
        <CardTitle className="text-base font-black text-slate-900">Practice Library</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          tests.map((test) => (
            <div key={test.testSetNumber} className="border border-slate-300 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center border border-blue-200 bg-blue-50">
                  <BookOpen className="h-4 w-4 text-blue-700" />
                </div>
                <span className="border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                  Set {test.testSetNumber}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">{test.title}</h3>
              <p className="mt-1 min-h-10 text-xs text-slate-600">{test.description}</p>
              <p className="mt-2 text-[11px] font-semibold text-slate-500">Estimated: {test.estimatedTime}</p>
              <button
                onClick={() => navigate(`/test/setup/${test.testSetNumber}`)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-slate-800 bg-slate-900 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800"
              >
                Start Test <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default StudentPracticeLibraryPage;
