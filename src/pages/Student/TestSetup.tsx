import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startTestSession, confirmInstructions } from '../../services/test.service';
import type { TestMode, TestModule } from '../../services/test.service';
import { ChevronRight, Loader2 } from 'lucide-react';

const TestSetup: React.FC = () => {
  const { setNumber } = useParams<{ setNumber: string }>();
  const navigate = useNavigate();

  const [mode, setMode] = useState<TestMode>('practice');
  const [selectedStart, setSelectedStart] = useState<'complete' | TestModule>('complete');
  const [stage, setStage] = useState<'landing' | 'details'>('landing');
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showImportantModal, setShowImportantModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSessionChoice, setShowSessionChoice] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState('');
  const [pendingModules, setPendingModules] = useState<TestModule[]>([]);
  const [pendingMode, setPendingMode] = useState<TestMode>('practice');

  const continueToInstructions = async (
    sessionId: string,
    sessionMode: TestMode,
    modulesForSession: TestModule[]
  ) => {
    localStorage.setItem('activeSessionId', sessionId);
    localStorage.setItem('activeTestSetNumber', String(setNumber));
    localStorage.setItem('activeModules', modulesForSession.join(','));
    
    // Auto-confirm instructions since we're skipping the dedicated screen
    try {
      await confirmInstructions(sessionId);
    } catch (err) {
      console.error('Failed to auto-confirm instructions', err);
    }

    // skip generic instructions and go to first module
    const first = modulesForSession[0] || 'writing';
    if (first === 'writing') {
      navigate(`/test/writing/${setNumber}/1?sessionId=${sessionId}&mode=${sessionMode}&modules=${modulesForSession.join(',')}`);
    } else if (first === 'speaking') {
      navigate(`/test/speaking/${setNumber}/1?sessionId=${sessionId}&mode=${sessionMode}&modules=${modulesForSession.join(',')}`);
    } else {
      // fallback if it's reading/listening
      navigate(`/test/${first}/${setNumber}?sessionId=${sessionId}&mode=${sessionMode}&modules=${modulesForSession.join(',')}`);
    }
  };

  const handleStart = async (forceNewSession = false) => {
    setError('');
    setIsLoading(true);
    try {
      const selectedModules: TestModule[] =
        selectedStart === 'complete'
          ? ['writing', 'speaking', 'reading', 'listening']
          : [selectedStart];
      const result = await startTestSession(Number(setNumber), { mode, selectedModules, forceNewSession });
      const modulesForSession =
        Array.isArray(result.selectedModules) && result.selectedModules.length > 0
          ? result.selectedModules
          : selectedModules;
      if (result.hasOngoingSession && !forceNewSession) {
        setPendingSessionId(result.sessionId);
        setPendingModules(modulesForSession);
        setPendingMode(result.mode);
        setShowSessionChoice(true);
        return;
      }
      setShowSessionChoice(false);
      await continueToInstructions(result.sessionId, result.mode, modulesForSession);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to start session. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ececec] font-sans">
      <header className="h-14 border-b border-slate-300 bg-white px-5 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">CELPIP · Study Materials</span>
        <button onClick={() => navigate('/dashboard')} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Back to Dashboard
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="border border-slate-300 bg-[#f5f5f5]">
          <div className="border-b border-slate-300 bg-[#e9e9e9] px-3 py-2 text-xs font-semibold text-slate-700">
            Practice Test {setNumber}
          </div>

          <div className="p-6 space-y-6">
            {stage === 'landing' && (
              <>
                <div className="space-y-3 text-sm text-slate-700 leading-6 text-center max-w-3xl mx-auto">
                  <h1 className="text-3xl font-black text-slate-900">Practice Tests</h1>
                  <p>
                    This practice test package contains two complete CELPIP-General Tests.
                    The package also includes answer keys for the Listening and Reading Tests and Performance Standards
                    showing the key factors that CELPIP Raters consider when they assess Writing and Speaking responses.
                  </p>
                  <p className="text-xs text-slate-500">
                    Click here to complete a survey on this product. We appreciate your feedback!
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowImportantModal(true)}
                    className="min-w-32 border border-slate-800 bg-slate-900 px-8 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800"
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="min-w-32 border border-slate-300 bg-white px-8 py-2 text-xs font-semibold text-slate-500"
                    disabled
                  >
                    Your Score
                  </button>
                </div>
              </>
            )}

            {stage === 'details' && (
              <div className="border border-slate-300 bg-white px-8 py-8">
                <div className="mx-auto max-w-4xl space-y-6 text-[13px] leading-7 text-slate-700">
                  <ol className="list-decimal space-y-4 pl-5">
                    <li>
                      You should give yourself 2 hours and 39 minutes to complete CELPIP-General Practice Test 1.
                      Press Start and select Complete Test from the drop-down menu to do the whole test, or click
                      on one of the individual tests underneath it to try one component.
                    </li>
                    <li>
                      Once you have completed the test, you can consult the Performance Standards for Writing and
                      Performance Standards for Speaking to understand how your responses would be evaluated by CELPIP Raters.
                      Please be sure to save your Writing responses and record your Speaking responses so you can review
                      them later using the Performance Standards. You can also compare your response with the sample
                      responses in Practice Test 1.
                    </li>
                    <li>
                      You will need a headset or speakers for the Listening and Speaking components of the test.
                      The practice test will not record your Speaking responses. If you wish to record your Speaking
                      responses, we advise you to set up your recording device (cellphone, digital recorder, etc.) prior
                      to starting the speaking section. For optimal performance, your computer should have a minimum
                      resolution of 1024 x 768. Paper and pencils will be provided at the official test for note-taking,
                      so before you begin this sample test make sure that you have paper and a pen or pencil, since you
                      may want to take notes.
                    </li>
                  </ol>

                  <div className="flex flex-col items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowStartMenu((prev) => !prev)}
                      className="min-w-36 border border-slate-800 bg-slate-900 px-8 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800"
                    >
                      Start
                    </button>
                    {showStartMenu && (
                      <div className="w-full max-w-sm space-y-2 border border-slate-300 bg-white p-3">
                        <select
                          value={selectedStart}
                          onChange={(e) => setSelectedStart(e.target.value as 'complete' | TestModule)}
                          className="h-9 w-full border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700"
                        >
                          <option value="complete">Complete Test</option>
                          <option value="listening">Listening</option>
                          <option value="reading">Reading</option>
                          <option value="writing">Writing</option>
                          <option value="speaking">Speaking</option>
                        </select>
                        <select
                          value={mode}
                          onChange={(e) => setMode(e.target.value as TestMode)}
                          className="h-9 w-full border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700"
                        >
                          <option value="practice">Practice</option>
                          <option value="simulation">Simulation</option>
                        </select>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleStart(false)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            {isLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Starting</>
                            ) : (
                              <>Continue <ChevronRight className="w-4 h-4" /></>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {showSessionChoice && (
                      <div className="w-full max-w-sm space-y-3 border border-amber-300 bg-amber-50 p-3">
                        <p className="text-xs font-semibold text-amber-900">
                          An ongoing session exists ({pendingMode} · {pendingModules.join(', ')}).
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void continueToInstructions(pendingSessionId, pendingMode, pendingModules)}
                            className="flex-1 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
                          >
                            Resume Ongoing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStart(true)}
                            disabled={isLoading}
                            className="flex-1 border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            Start New
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-300 bg-[#fafafa] px-3 py-2 text-[11px] leading-5 text-slate-600">
                    NOTE: In response to ongoing research and development, updates may be made to this practice
                    material. The current official test format on the CELPIP website always takes priority.
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      {showImportantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl border border-slate-300 bg-white shadow-2xl">
            <div className="border-b border-slate-300 bg-[#f3f3f3] px-4 py-2 text-sm font-semibold text-slate-800">
              Important Note
            </div>
            <div className="p-4 text-xs leading-5 text-slate-700 space-y-2">
              <p>
                In this practice test, users have the ability to go back and review or change their answers at any time.
                In the official test, once you have completed a section and moved to the next one, it is not possible to return to it.
              </p>
              <p>
                In this practice test, users have the ability to control audio and video tracks with a playbar.
                In the official test, audio and video tracks will only play once and users will not have access to a playbar.
              </p>
              <div className="pt-1">
                <p className="font-semibold text-slate-800">To access the sample Writing and Speaking responses:</p>
                <ol className="mt-1 list-decimal pl-4 space-y-0.5">
                  <li>Start either the Writing or Speaking portion of the test.</li>
                  <li>In each task, you will see the text &quot;Click here to view sample responses.&quot;</li>
                  <li>Click on this text to access the samples.</li>
                </ol>
              </div>
            </div>
            <div className="border-t border-slate-300 px-4 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowImportantModal(false);
                  setStage('details');
                  setShowStartMenu(false);
                }}
                className="border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-slate-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSetup;
