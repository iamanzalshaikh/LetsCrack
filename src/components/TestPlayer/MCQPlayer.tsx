import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { getMCQTask, submitMCQAnswers } from '../../services/mcq.service';
import type { MCQAnswer } from '../../services/mcq.service';
import { recordMediaEvent } from '../../services/test.service';
import {
  Clock, ChevronLeft, ChevronRight, Loader2, AlertCircle,
  Headphones, BookOpen, Play, VolumeX, CheckCircle2, Send
} from 'lucide-react';

type MCQModule = 'reading' | 'listening';
type MCQQuestion = { _id: string; questionText: string; options: string[] };
type MCQTask = { mcqs?: MCQQuestion[]; passageText?: string; audioUrl?: string };
type MCQResult = { score: number; total: number; percentage: number | string; band: number | string };

const MCQPlayer: React.FC<{ moduleType: MCQModule }> = ({ moduleType }) => {
  const { setNumber } = useParams<{ setNumber: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const sessionId = searchParams.get('sessionId') || '';
  const modules = (searchParams.get('modules') || localStorage.getItem('activeModules') || moduleType).split(',');

  const [task, setTask] = useState<MCQTask | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<MCQResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [preludeStep, setPreludeStep] = useState<0 | 1 | 2>(0);

  // Listening specific
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [audioBlockReason, setAudioBlockReason] = useState('');
  const [playCount, setPlayCount] = useState(0);
  const [audioPolicy, setAudioPolicy] = useState<{ allowReplay: boolean; allowSeek: boolean; playLimit: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modulePreludeKey = `mcq-prelude-seen-${moduleType}-${sessionId || `set-${setNumber}`}`;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMCQTask(moduleType, Number(setNumber));
        setTask(data);
        // Default time: 47 min reading, 47 min listening (CELPIP standard)
        setTimeLeft(moduleType === 'reading' ? 2820 : 2820);
        setPreludeStep(localStorage.getItem(modulePreludeKey) ? 2 : 0);
      } catch (err: unknown) {
        const message =
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
            ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
            : 'Failed to load task. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [setNumber, moduleType, modulePreludeKey]);

  const handleAudioPlay = async () => {
    if (!sessionId) return;
    try {
      const res = await recordMediaEvent(sessionId, moduleType, 1, playCount === 0 ? 'play_start' : 'replay_attempt');
      setAudioPolicy(res.policy);
      setPlayCount(res.runtimeState.playCount);
      if (!res.allowed) {
        setAudioBlocked(true);
        setAudioBlockReason(
          res.reason === 'replay_disabled'
            ? 'Audio replay is disabled in this session.'
            : res.reason === 'play_limit_exceeded'
            ? 'Play limit reached for this audio.'
            : 'Audio blocked by exam policy.'
        );
        return;
      }
      setAudioPlayed(true);
      audioRef.current?.play();
    } catch {
      // Still allow play if media event fails (graceful degradation)
      setAudioPlayed(true);
      audioRef.current?.play();
    }
  };

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);

    const answerList: MCQAnswer[] = (task?.mcqs || []).map((q: MCQQuestion) => ({
      questionId: q._id,
      selectedOption: answers[q._id] ?? -1,
    }));

    try {
      const res = await submitMCQAnswers({
        studentId: user!.id,
        testSetNumber: Number(setNumber),
        module: moduleType,
        answers: answerList,
      });
      setResult(res);
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Submission failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, isSubmitting, setNumber, submitted, task, user, moduleType]);

  // Countdown timer
  useEffect(() => {
    if (isLoading || submitted || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          if (!isSubmitting && task) {
            void handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [handleSubmit, isLoading, isSubmitting, submitted, task, timeLeft]);

  const handleNext = () => {
    // Navigate to next module or results
    const moduleOrder: string[] = modules.filter(Boolean);
    const currentIdx = moduleOrder.indexOf(moduleType);
    const nextModule = moduleOrder[currentIdx + 1];
    if (nextModule) {
      const path = nextModule === 'reading' || nextModule === 'listening'
        ? `/test/${nextModule}/${setNumber}?sessionId=${sessionId}&modules=${modules.join(',')}`
        : nextModule === 'writing'
        ? `/test/writing/${setNumber}/1?sessionId=${sessionId}&modules=${modules.join(',')}`
        : `/test/speaking/${setNumber}/1?sessionId=${sessionId}&modules=${modules.join(',')}`;
      navigate(path);
    } else {
      navigate(`/results/${setNumber}?sessionId=${sessionId}`);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle className="w-14 h-14 text-amber-500" />
        <h2 className="text-2xl font-black text-slate-900">Task Not Found</h2>
        <p className="text-slate-500 max-w-md">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl">Back to Dashboard</button>
      </div>
    );
  }

  if (preludeStep === 0) {
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center p-6">
        <div className="w-full max-w-3xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-[#f3f3f3] px-5 py-3">
            <h2 className="text-base font-bold text-slate-800">Important Note</h2>
          </div>
          <div className="space-y-3 px-5 py-5 text-sm leading-6 text-slate-700">
            <p>In practice mode, you can go back and review your answers.</p>
            <p>In simulation mode, completed sections are locked and cannot be revisited.</p>
            <p>Reading/Listening will continue with official-style timing and auto-submit on timeout.</p>
          </div>
          <div className="border-t border-slate-300 px-5 py-3 flex justify-end">
            <button
              type="button"
              onClick={() => setPreludeStep(1)}
              className="border border-slate-800 bg-slate-900 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (preludeStep === 1) {
    const title = moduleType === 'reading' ? 'Reading Instructions' : 'Listening Instructions';
    return (
      <div className="min-h-screen bg-[#ececec] flex items-center justify-center p-6">
        <div className="w-full max-w-3xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-[#f3f3f3] px-5 py-3">
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
          </div>
          <div className="space-y-3 px-5 py-5 text-sm leading-6 text-slate-700">
            {moduleType === 'reading' ? (
              <>
                <p>Read the passage carefully and answer each question based only on the provided text.</p>
                <p>You can move between questions and update choices before final submission.</p>
              </>
            ) : (
              <>
                <p>Play the audio when ready and answer questions according to the recording.</p>
                <p>Replay and seek behavior follows the test policy configured for this session.</p>
              </>
            )}
          </div>
          <div className="border-t border-slate-300 px-5 py-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(modulePreludeKey, '1');
                setPreludeStep(2);
              }}
              className="border border-slate-800 bg-slate-900 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-8 p-8 font-sans">
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-900/5 p-14 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {moduleType === 'reading' ? 'Reading' : 'Listening'} Complete!
          </h2>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
              <p className="text-2xl font-black text-slate-900">{result.score}/{result.total}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">%</p>
              <p className="text-2xl font-black text-blue-600">{result.percentage}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Band</p>
              <p className="text-2xl font-black text-slate-900">{result.band}</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Results submitted for AI evaluation.</p>
          <button onClick={handleNext} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-sm">
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const mcqs = task?.mcqs || [];
  const question = mcqs[currentQuestion];

  return (
    <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            {moduleType === 'reading'
              ? <BookOpen className="w-4 h-4 text-emerald-600" />
              : <Headphones className="w-4 h-4 text-amber-600" />}
            <span className="text-sm font-black text-slate-900">
              {moduleType === 'reading' ? 'Reading' : 'Listening'} — Test #{setNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Q {currentQuestion + 1} / {mcqs.length}
          </span>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-black tabular-nums font-mono transition-all ${
            timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-600'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Passage / Audio */}
        <div className="w-1/2 border-r border-slate-100 overflow-y-auto bg-slate-50/30 p-10">
          {moduleType === 'reading' ? (
            <div className="space-y-6">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Reading Passage</span>
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 text-slate-700 text-sm leading-8 font-medium whitespace-pre-wrap">
                {task?.passageText || 'Passage content will appear here.'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Audio Track</span>
              {task?.audioUrl ? (
                <>
                  {audioBlocked ? (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <VolumeX className="w-10 h-10 text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-red-600">{audioBlockReason}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div
                        onClick={handleAudioPlay}
                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-all shadow-2xl ${
                          audioPlayed ? 'bg-amber-100 shadow-amber-500/20' : 'bg-amber-500 shadow-amber-500/30 hover:scale-105'
                        }`}
                      >
                        <Play className={`w-10 h-10 ${audioPlayed ? 'text-amber-600' : 'text-white'} fill-current`} />
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {audioPlayed
                          ? audioPolicy?.allowReplay
                            ? `Played ${playCount}x — Replay allowed`
                            : 'Audio has been played — No replay in this mode'
                          : 'Click to play audio'}
                      </p>
                      <audio ref={audioRef} src={task.audioUrl} onEnded={() => {}} hidden />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-sm font-medium">No audio file for this task.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Questions */}
        <div className="w-1/2 flex flex-col bg-white overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / mcqs.length) * 100}%` }}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            {question && (
              <>
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {currentQuestion + 1}</span>
                  <p className="text-lg font-bold text-slate-900 leading-relaxed">{question.questionText}</p>
                </div>
                <div className="space-y-3">
                  {question.options.map((opt: string, idx: number) => {
                    const selected = answers[question._id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(question._id, idx)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-sm flex items-center gap-4 ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-slate-100 bg-slate-50 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}>
                          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="h-24 border-t border-slate-50 flex items-center justify-between px-10 shrink-0 bg-white">
            <button
              onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQuestion < mcqs.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(p => Math.min(mcqs.length - 1, p + 1))}
                className="flex items-center gap-2 bg-slate-900 text-white font-black px-8 py-4 rounded-2xl text-sm hover:bg-slate-800 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-2xl text-sm transition-all disabled:opacity-60"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Answers</>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MCQPlayer;
