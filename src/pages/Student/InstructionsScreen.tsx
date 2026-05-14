import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTestInstructions, confirmInstructions } from '../../services/test.service';
import type { TestModule } from '../../services/test.service';
import { BookOpen, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const InstructionsScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const setNumber = Number(searchParams.get('setNumber') || '1');
  const mode = (searchParams.get('mode') || 'practice') as 'practice' | 'simulation';
  const modulesParam = searchParams.get('modules') || localStorage.getItem('activeModules') || 'writing';
  const modules = modulesParam
    .split(',')
    .map((m) => m.trim())
    .filter((m): m is TestModule => ['writing', 'speaking', 'reading', 'listening'].includes(m));

  const [instructions, setInstructions] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTestInstructions(setNumber, mode);
        setInstructions(data.instructions || getDefaultInstructions(mode));
        setEstimatedTime(data.estimatedTimeMinutes);
      } catch {
        setInstructions(getDefaultInstructions(mode));
        setEstimatedTime(mode === 'simulation' ? 180 : 90);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [setNumber, mode]);

  const getDefaultInstructions = (m: string) =>
    m === 'simulation'
      ? `**CELPIP Simulation Mode — Exam Conditions Apply**\n\nThis session replicates official CELPIP test conditions:\n• Audio for Listening tasks plays **once only** — no replays.\n• All modules are strictly timed. When time expires, your response is auto-submitted.\n• Do not refresh, close, or navigate away during the test.\n• Ensure your microphone is connected and working before starting the Speaking module.\n• Ensure you are in a quiet, distraction-free environment.\n\nOnce you begin, you must complete all selected modules in sequence.`
      : `**Practice Mode — Learn at Your Own Pace**\n\nThis session is designed for focused preparation:\n• You may replay audio tracks in the Listening module.\n• Time limits are relaxed — focus on quality over speed.\n• All writing responses are auto-saved every 30 seconds.\n• You can pause between modules.\n\nWhen you are ready to simulate real exam conditions, switch to Simulation Mode.`;

  const handleAccept = async () => {
    if (!sessionId) return;
    setIsAccepting(true);
    try {
      await confirmInstructions(sessionId);
      setAccepted(true);
      // Navigate to first module
      const firstModule = modules[0];
      setTimeout(() => {
        navigateToModule(firstModule, sessionId);
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const navigateToModule = (mod: TestModule, sid: string) => {
    switch (mod) {
      case 'writing':
        navigate(`/test/writing/${setNumber}/1?sessionId=${sid}&modules=${modules.join(',')}`);
        break;
      case 'speaking':
        navigate(`/test/speaking/${setNumber}/1?sessionId=${sid}&modules=${modules.join(',')}`);
        break;
      case 'reading':
        navigate(`/test/reading/${setNumber}?sessionId=${sid}&modules=${modules.join(',')}`);
        break;
      case 'listening':
        navigate(`/test/listening/${setNumber}?sessionId=${sid}&modules=${modules.join(',')}`);
        break;
    }
  };

  const MODULE_LABELS: Record<TestModule, string> = {
    writing: 'Writing',
    speaking: 'Speaking',
    reading: 'Reading',
    listening: 'Listening',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col font-sans">
      <header className="h-14 bg-white border-b border-slate-300 flex items-center px-6 gap-3">
        <BookOpen className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-bold text-slate-800">
          CELPIP Instructions — {mode === 'simulation' ? 'Simulation Mode' : 'Practice Mode'}
        </span>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        <div className="border border-slate-300 bg-[#f5f5f5]">
          <div className="border-b border-slate-300 bg-[#e9e9e9] px-3 py-2 text-xs font-semibold text-slate-700">
            Before You Begin
          </div>

          <div className="space-y-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                mode === 'simulation' ? 'bg-slate-900 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                {mode === 'simulation' ? 'Simulation Mode' : 'Practice Mode'}
              </span>
              {estimatedTime > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Est. {estimatedTime} min
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Modules in this session</h2>
              <div className="flex flex-wrap gap-2">
                {modules.map((mod, i) => (
                  <div key={mod} className="flex items-center gap-2 border border-slate-300 bg-white px-3 py-1.5">
                    <span className="text-[11px] font-bold text-slate-500">{i + 1}.</span>
                    <span className="text-xs font-semibold text-slate-700">{MODULE_LABELS[mod]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-300 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Important Note</p>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• In practice mode, you can revisit and improve your answers.</li>
                <li>• In simulation mode, completed tasks are locked like the real exam.</li>
                <li>• Keep your internet stable and avoid refreshing during an active section.</li>
              </ul>
            </div>

            <div className="border border-slate-300 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Instructions</p>
              <div className="space-y-2 text-sm leading-6 text-slate-700">
                {instructions.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} className="font-bold text-slate-900 mt-3">{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('•')) {
                    return <p key={i}>• {line.slice(1).trim()}</p>;
                  }
                  return line ? <p key={i}>{line}</p> : <div key={i} className="h-1" />;
                })}
              </div>
            </div>

            <div className="border border-slate-300 bg-[#fafafa] px-3 py-2 text-xs text-slate-600">
              Instruction videos and module-specific briefings will appear before each module starts.
            </div>

            {error && (
              <div className="flex items-center gap-2 border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-slate-300 px-6 py-4 flex justify-end">
            {accepted ? (
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5" /> Confirmed. Starting your test...
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="border border-slate-800 bg-slate-900 px-6 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 flex items-center gap-2"
              >
                {isAccepting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                ) : (
                  <>I Have Read & Understood — Begin Test</>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructionsScreen;
