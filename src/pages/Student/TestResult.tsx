import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getResultStatus, getTestResults, downloadCertificate, downloadAiEvaluationPdf } from '../../services/test.service';
import { useAuthStore } from '../../store/useAuthStore';
import { connectGradingSocket, disconnectGradingSocket } from '../../services/gradingSocket.service';
import {
    Trophy,
    ChevronLeft,
    Download,
    Loader2,
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    BrainCircuit,
    Info,
    Copy,
    LayoutDashboard,
} from 'lucide-react';

type ResultStatusData = {
    status: 'in_progress' | 'submitted' | 'grading' | 'graded';
    progress: { overall: { graded: number; total: number } };
};

type WritingSubmissionEntry = {
    taskNumber: number;
    responseText?: string;
    wordCount?: number;
    /** Saved by autosave without final Submit task (see WritingPlayer). */
    submissionStatus?: 'submitted' | 'draft';
};

type WritingInsightRow = {
    taskNumber: number;
    responseText?: string;
    overallBand?: number | string;
    /** CELPIP Writing (/6) */
    coherence?: number | string;
    vocabulary?: number | string;
    readability?: number | string;
    taskFulfillment?: number | string;
    taskAchievement?: number | string;
    coherenceCohesion?: number | string;
    lexicalResource?: number | string;
    grammar?: number | string;
    feedback?: string;
    overallRemark?: string;
    detailedFeedback?: string;
    categoryBullets?: {
        coherenceMeaning?: string[];
        vocabulary?: string[];
        readability?: string[];
        taskFulfillment?: string[];
    };
    strengths?: string[];
    improvements?: string[];
    quickTips?: string[];
    lineFeedback?: Array<{ original: string; issue: string; fix: string }>;
    modelAnswer?: string;
};

type TestResultData = {
    _id?: string;
    writingBand?: number | string;
    speakingBand?: number | string;
    readingBand?: number | string;
    listeningBand?: number | string;
    overallBand?: number | string;
    submittedAt?: string;
    publishedAt?: string;
    writingFeedback?: string[];
    speakingFeedback?: string[];
    writingSubmissions?: WritingSubmissionEntry[];
    writingInsights?: WritingInsightRow[];
    /** Task tabs from CMS (both tasks listed even when one submission is missing). */
    expectedWritingTaskNumbers?: number[];
};

const TestResult: React.FC = () => {
    const { setNumber } = useParams<{ setNumber: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [results, setResults] = useState<TestResultData | null>(null);
    const [status, setStatus] = useState<ResultStatusData | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadingAiPdf, setIsDownloadingAiPdf] = useState(false);
    const [activeTab, setActiveTab] = useState<'analysis' | 'corrections' | 'model'>('analysis');
    const [writingScope, setWritingScope] = useState<number | 'all'>('all');
    const [actionMessage, setActionMessage] = useState('');
    // Prefer sessionId from URL (set after test), fallback to localStorage
    const activeSessionId = searchParams.get('sessionId') || localStorage.getItem('activeSessionId');

    const parseErrorMessage = (error: unknown, fallback: string) => {
        if (
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ) {
            return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback;
        }
        return fallback;
    };

    const fetchResults = useCallback(
        async (targetSet: number) => {
            const data = await getTestResults(targetSet, activeSessionId);
            setResults(data);
            return data;
        },
        [activeSessionId]
    );

    const fetchStatus = useCallback(async (sessionId: string) => {
        const data = await getResultStatus(sessionId);
        setStatus(data);
        return data;
    }, []);

    useEffect(() => {
        const hydrate = async () => {
            if (!setNumber) {
                setIsLoading(false);
                return;
            }
            try {
                await fetchResults(Number(setNumber));
                setStatusMessage('');
            } catch {
                if (activeSessionId) {
                    try {
                        const current = await fetchStatus(activeSessionId);
                        if (current.status === 'graded') {
                            await fetchResults(Number(setNumber));
                            localStorage.removeItem('activeSessionId');
                            localStorage.removeItem('activeTestSetNumber');
                        } else {
                            setStatusMessage('AI is still grading your attempt. We will auto-refresh shortly.');
                        }
                    } catch (statusError: unknown) {
                        setStatusMessage(parseErrorMessage(statusError, 'Unable to load grading status.'));
                    }
                } else {
                    setStatusMessage('Result not ready yet. Please refresh in a moment.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        hydrate();
    }, [activeSessionId, fetchResults, fetchStatus, setNumber]);

    /** Poll until fully graded — must NOT stop when first `results` payload arrives or Task N insight lags Task N+1. */
    useEffect(() => {
        if (!activeSessionId || !setNumber) return;
        const intervalRef = { current: null as ReturnType<typeof setInterval> | null };
        const poll = async () => {
            try {
                const s = await fetchStatus(activeSessionId);
                await fetchResults(Number(setNumber));
                if (s.status === 'graded') {
                    localStorage.removeItem('activeSessionId');
                    localStorage.removeItem('activeTestSetNumber');
                    setStatusMessage('');
                    if (intervalRef.current) {
                        window.clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            } catch {
                // Keep polling.
            }
        };
        intervalRef.current = window.setInterval(poll, 10000);
        void poll();
        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [activeSessionId, fetchResults, fetchStatus, setNumber]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !activeSessionId || !setNumber) return;
        const listeners = {
            onUpdated: async (payload: { sessionId: string; status?: string }) => {
                if (String(payload.sessionId) !== String(activeSessionId)) return;
                /** Per-task jobs emit `grading` until all modules complete — always refetch insights. */
                await fetchResults(Number(setNumber));
                await fetchStatus(activeSessionId);
                if (payload.status === 'graded') {
                    localStorage.removeItem('activeSessionId');
                    localStorage.removeItem('activeTestSetNumber');
                    setStatusMessage('');
                }
            },
            onFailed: (payload: { sessionId: string; message?: string }) => {
                if (String(payload.sessionId) === String(activeSessionId)) {
                    setStatusMessage(payload.message || 'Grading delayed. Retrying in background.');
                }
            },
        };
        connectGradingSocket(token, listeners);
        return () => disconnectGradingSocket(listeners);
    }, [activeSessionId, fetchResults, fetchStatus, setNumber]);

    const statusTone = useMemo(() => {
        if (!status) return 'Pending';
        if (status.status === 'graded') return 'Graded';
        if (status.status === 'grading') return 'AI Grading';
        if (status.status === 'submitted') return 'Submitted';
        return 'In Progress';
    }, [status]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-surface-2 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen bg-surface-2 flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="w-16 h-16 text-amber-500 mb-6" />
                <h1 className="text-3xl font-black text-slate-900 mb-4">Results are being processed</h1>
                <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                    {statusMessage || 'Our AI is currently evaluating your responses. This usually takes 30-60 seconds after submission.'}
                </p>
                {status ? (
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700">
                        {statusTone} · Overall {status.progress.overall.graded}/{status.progress.overall.total}
                    </div>
                ) : null}
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        Refresh Status
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="text-slate-500 font-bold px-8 py-4">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    const { writingBand, speakingBand, readingBand, listeningBand, overallBand, submittedAt } = results;
    const writingFeedback: string[] = Array.isArray(results?.writingFeedback) ? results.writingFeedback : [];
    const speakingFeedback: string[] = Array.isArray(results?.speakingFeedback) ? results.speakingFeedback : [];
    const aiFeedback = [...writingFeedback, ...speakingFeedback];

    const writingSubmissionsList: WritingSubmissionEntry[] = Array.isArray(results.writingSubmissions)
        ? results.writingSubmissions
        : [];
    const insightsList: WritingInsightRow[] = Array.isArray(results.writingInsights) ? results.writingInsights : [];

    const resolvedTaskNumbers = [...new Set([...writingSubmissionsList.map((s) => s.taskNumber), ...insightsList.map((i) => i.taskNumber)])]
        .filter((n): n is number => Number.isFinite(n))
        .sort((a, b) => a - b);

    const expectedWritingTaskNumbers =
        Array.isArray(results.expectedWritingTaskNumbers) && results.expectedWritingTaskNumbers.length > 0
            ? results.expectedWritingTaskNumbers
            : [];

    /** Tabs: always show Task 1 & 2 (etc.) when the test set defines them, not only submitted tasks */
    const writingTabTaskNumbers = [...new Set([...expectedWritingTaskNumbers, ...resolvedTaskNumbers])]
        .filter((n): n is number => Number.isFinite(n))
        .sort((a, b) => a - b);

    const responseTextForTask = (n: number): string => {
        const sub = writingSubmissionsList.find((x) => x.taskNumber === n);
        const ins = insightsList.find((x) => x.taskNumber === n);
        return String(sub?.responseText ?? ins?.responseText ?? '').trim();
    };

    let effectiveWritingScope: number | 'all' = writingScope;
    if (writingTabTaskNumbers.length > 0) {
        if (writingScope !== 'all' && !writingTabTaskNumbers.includes(writingScope)) {
            effectiveWritingScope = writingTabTaskNumbers[0]!;
        }
    } else {
        effectiveWritingScope = 'all';
    }

    const activeWritingInsight =
        effectiveWritingScope === 'all' ? undefined : insightsList.find((i) => i.taskNumber === effectiveWritingScope);

    const insightStrengths = Array.isArray(activeWritingInsight?.strengths)
        ? activeWritingInsight!.strengths.slice(0, 6)
        : [];
    const insightImprovements = Array.isArray(activeWritingInsight?.improvements)
        ? activeWritingInsight!.improvements.slice(0, 6)
        : [];
    const insightTips = Array.isArray(activeWritingInsight?.quickTips) ? activeWritingInsight!.quickTips.slice(0, 5) : [];
    const insightLineFeedback = Array.isArray(activeWritingInsight?.lineFeedback)
        ? activeWritingInsight!.lineFeedback.slice(0, 4)
        : [];
    const insightModelAnswer =
        typeof activeWritingInsight?.modelAnswer === 'string' ? activeWritingInsight!.modelAnswer.trim() : '';

    const hasWritingModuleSection =
        writingTabTaskNumbers.length > 0 || insightsList.length > 0 || resolvedTaskNumbers.length > 0;

    const combinedWritingForCopy =
        writingTabTaskNumbers.length === 0
            ? ''
            : writingTabTaskNumbers
                  .map((n) => {
                      const body = responseTextForTask(n);
                      return `Task ${n}\n\n${body || '(No submission recorded for this task.)'}`;
                  })
                  .join('\n\n────────\n\n');

    const copyAllWriting = async () => {
        if (!combinedWritingForCopy) return;
        try {
            await navigator.clipboard.writeText(combinedWritingForCopy);
            setActionMessage('Full writing copied to clipboard.');
            window.setTimeout(() => setActionMessage(''), 2500);
        } catch {
            setActionMessage('Could not copy. Select text manually.');
        }
    };

    const goDashboardEndAttempt = () => {
        localStorage.removeItem('activeSessionId');
        localStorage.removeItem('activeTestSetNumber');
        navigate('/dashboard');
    };

    const isDraftSubmission = (taskNum: number) =>
        writingSubmissionsList.find((x) => x.taskNumber === taskNum)?.submissionStatus === 'draft';

    const scoreCards = [
        { label: 'Writing', value: writingBand || '—' },
        { label: 'Speaking', value: speakingBand || '—' },
        { label: 'Reading', value: readingBand || '—' },
        { label: 'Listening', value: listeningBand || '—' },
    ];
    const criteriaRow = [
        { label: 'Overall', value: activeWritingInsight?.overallBand != null ? `${activeWritingInsight.overallBand}/6` : '—' },
        {
            label: 'Coherence',
            value: activeWritingInsight?.coherence ?? activeWritingInsight?.coherenceCohesion ?? '—',
        },
        { label: 'Vocabulary', value: activeWritingInsight?.vocabulary ?? activeWritingInsight?.lexicalResource ?? '—' },
        { label: 'Readability', value: activeWritingInsight?.readability ?? activeWritingInsight?.grammar ?? '—' },
        {
            label: 'Task',
            value: activeWritingInsight?.taskFulfillment ?? activeWritingInsight?.taskAchievement ?? '—',
        },
    ];
    const shortSummary = `${insightStrengths[0] || 'Strong structure and grammar.'} ${insightImprovements[0] || 'Needs slightly more detail and a formal opening.'}`;
    const criterionNote = (name: string, value: number | string | undefined) => {
        const score = Number(value);
        if (!Number.isFinite(score)) return `${name}: Score pending.`;
        if (score >= 5.5) return `${name}: Strong CELPIP-level performance for this criterion (/6).`;
        if (score >= 4) return `${name}: Adequate communication with room to strengthen control and depth.`;
        return `${name}: Needs focused improvement to reach a stronger CELPIP band.`;
    };

    return (
        <div className="min-h-screen bg-[#ececec] flex flex-col font-sans pb-10">
            {/* Header */}
            <header className="h-14 bg-white border-b border-slate-300 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/dashboard')} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-sm font-bold text-slate-900">Performance Report <span className="text-slate-400 ml-2">#SET{setNumber}</span></h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:inline">
                        Submitted {submittedAt ? new Date(submittedAt).toLocaleDateString() : '—'}
                    </span>
                    <button
                        type="button"
                        onClick={goDashboardEndAttempt}
                        className="flex items-center gap-2 border border-slate-300 bg-white text-slate-800 font-bold px-3 py-1.5 rounded text-xs hover:bg-slate-50"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button 
                        onClick={async () => {
                            if (!results?._id) return;
                            setIsDownloading(true);
                            try {
                                await downloadCertificate(results._id, `${user?.firstName}_${user?.lastName}`);
                            } finally {
                                setIsDownloading(false);
                            }
                        }}
                        disabled={isDownloading || !results?._id}
                        className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 font-bold px-3 py-1.5 rounded text-xs hover:bg-slate-50 disabled:opacity-40"
                    >
                        <Download className="w-4 h-4" /> {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button
                        onClick={async () => {
                            if (!setNumber) return;
                            setIsDownloadingAiPdf(true);
                            try {
                                await downloadAiEvaluationPdf(
                                    Number(setNumber),
                                    `${user?.firstName || 'Student'}_${user?.lastName || ''}`.trim(),
                                    activeSessionId
                                );
                            } finally {
                                setIsDownloadingAiPdf(false);
                            }
                        }}
                        disabled={isDownloadingAiPdf}
                        className="flex items-center gap-2 border border-blue-300 bg-blue-50 text-blue-800 font-bold px-3 py-1.5 rounded text-xs hover:bg-blue-100 disabled:opacity-40"
                    >
                        <Download className="w-4 h-4" /> {isDownloadingAiPdf ? 'Preparing AI PDF...' : 'Download AI Report PDF'}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Summary Side */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
                        <div className="h-10 border-b border-slate-100 bg-slate-50/50 px-4 flex items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Results</span>
                        </div>
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                <Trophy className="w-12 h-12 text-blue-600" />
                            </div>
                            
                            <h2 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">{overallBand ?? '—'}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Overall Band</p>
                            
                            <div className="w-full space-y-3">
                                {scoreCards.map((card) => (
                                    <div key={card.label} className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-lg">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                                        <span className="text-xl font-black text-slate-900">{card.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Feedback Details Side */}
                <div className="lg:col-span-8 space-y-4">

                    {hasWritingModuleSection && (
                        <section className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm rounded-xl space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Writing Analysis</h3>
                                {writingTabTaskNumbers.length >= 1 ? (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {writingTabTaskNumbers.map((n) => (
                                            <button
                                                key={`tw-${n}`}
                                                type="button"
                                                onClick={() => setWritingScope(n)}
                                                className={`px-3 py-1.5 text-xs font-bold border ${
                                                    effectiveWritingScope === n
                                                        ? 'border-slate-800 bg-slate-900 text-white'
                                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                Task {n}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setWritingScope('all')}
                                            className={`px-3 py-1.5 text-xs font-bold border ${
                                                effectiveWritingScope === 'all'
                                                    ? 'border-slate-800 bg-slate-900 text-white'
                                                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            All Writing
                                        </button>
                                        {effectiveWritingScope === 'all' && combinedWritingForCopy ? (
                                            <button
                                                type="button"
                                                onClick={copyAllWriting}
                                                className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                            >
                                                <Copy className="w-3.5 h-3.5" /> Copy all
                                            </button>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            {/* Your writing (full text) */}
                            <div className="border border-slate-200 bg-slate-50/80 p-4 space-y-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Your submitted writing</p>
                                {effectiveWritingScope === 'all' ? (
                                    <div className="space-y-6">
                                        {writingTabTaskNumbers.length === 0 ? (
                                            <p className="text-sm text-slate-500">No writing text was found for this attempt.</p>
                                        ) : (
                                            writingTabTaskNumbers.map((n) => (
                                                <div key={`block-${n}`} className="space-y-2">
                                                    <p className="text-xs font-black text-slate-800">Task {n}</p>
                                                    {isDraftSubmission(n) ? (
                                                        <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 leading-relaxed">
                                                            <span className="font-bold">Draft:</span> autosave only — use{' '}
                                                            <span className="font-semibold">Submit Task {n}</span> in the player to finalize
                                                            and send for AI grading.
                                                        </div>
                                                    ) : null}
                                                    <div className="max-h-[420px] overflow-y-auto rounded border border-slate-200 bg-white p-4">
                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                                                            {responseTextForTask(n) || 'No text submitted for this task.'}
                                                        </p>
                                                    </div>
                                                    {writingSubmissionsList.find((x) => x.taskNumber === n)?.wordCount != null ? (
                                                        <p className="text-xs text-slate-500">
                                                            Words reported:{' '}
                                                            {writingSubmissionsList.find((x) => x.taskNumber === n)!.wordCount}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            ))
                                        )}
                                        <div className="rounded border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs text-blue-900">
                                            Per-task scoring, corrections, and model answers are tied to{' '}
                                            <span className="font-bold">Task 1</span> or{' '}
                                            <span className="font-bold">Task 2</span> tabs above — switch there for detailed AI breakdown.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {typeof effectiveWritingScope === 'number' &&
                                        isDraftSubmission(effectiveWritingScope) ? (
                                            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 leading-relaxed">
                                                <span className="font-bold">Draft:</span> press{' '}
                                                <span className="font-semibold">Submit Task {effectiveWritingScope}</span> during the attempt
                                                to finalize this task (autosave ≠ submit).
                                            </div>
                                        ) : null}
                                        <div className="max-h-[420px] overflow-y-auto rounded border border-slate-200 bg-white p-4">
                                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                                                {responseTextForTask(effectiveWritingScope) ||
                                                    'No text submitted for this task yet.'}
                                            </p>
                                        </div>
                                        {writingSubmissionsList.find((x) => x.taskNumber === effectiveWritingScope)?.wordCount != null ? (
                                            <p className="text-xs text-slate-500">
                                                Words reported:{' '}
                                                {
                                                    writingSubmissionsList.find((x) => x.taskNumber === effectiveWritingScope)!
                                                        .wordCount
                                                }
                                            </p>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {effectiveWritingScope !== 'all' && !activeWritingInsight ? (
                                <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                    AI grading for Task {effectiveWritingScope} is still finishing. Refresh in a minute or switch tasks to
                                    read your submission.
                                </div>
                            ) : null}

                            {effectiveWritingScope !== 'all' && activeWritingInsight ? (
                                <>
                                    <div className="border border-slate-300 bg-slate-50 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-slate-800">Task {effectiveWritingScope} · CELPIP band</p>
                                            <p className="text-4xl font-black text-slate-900">
                                                {activeWritingInsight.overallBand != null
                                                    ? `${activeWritingInsight.overallBand}/6`
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {criteriaRow.map((item) => (
                                                <span
                                                    key={item.label}
                                                    className="border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700"
                                                >
                                                    {item.label}: {item.value}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-700 leading-6 line-clamp-3">{shortSummary}</p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="border border-emerald-200 bg-emerald-50/70 p-4">
                                            <h5 className="text-sm font-black text-emerald-900 mb-2">Strengths</h5>
                                            {insightStrengths.length > 0 ? (
                                                <ul className="list-disc pl-5 text-sm text-emerald-900/90 space-y-1">
                                                    {insightStrengths.map((s, i) => (
                                                        <li key={`s-${i}`}>{s}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-emerald-900/70">No strengths available yet.</p>
                                            )}
                                        </div>
                                        <div className="border border-rose-200 bg-rose-50/70 p-4">
                                            <h5 className="text-sm font-black text-rose-900 mb-2">Improvements</h5>
                                            {insightImprovements.length > 0 ? (
                                                <ul className="list-disc pl-5 text-sm text-rose-900/90 space-y-1">
                                                    {insightImprovements.map((s, i) => (
                                                        <li key={`i-${i}`}>{s}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-rose-900/70">No improvement points available yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-blue-200 bg-blue-50/70 p-4">
                                        <h5 className="text-sm font-black text-blue-900 mb-2">Quick Tips</h5>
                                        {insightTips.length > 0 ? (
                                            <ul className="list-disc pl-5 text-sm text-blue-900/90 space-y-1">
                                                {insightTips.map((s, i) => (
                                                    <li key={`t-${i}`}>{s}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-blue-900/70">No quick tips available yet.</p>
                                        )}
                                    </div>

                                    <div className="border border-slate-300 bg-white">
                                        <div className="h-10 border-b border-slate-300 px-3 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('analysis')}
                                                className={`px-3 py-1 text-xs font-bold border ${
                                                    activeTab === 'analysis'
                                                        ? 'border-slate-800 bg-slate-900 text-white'
                                                        : 'border-slate-300 bg-white text-slate-700'
                                                }`}
                                            >
                                                Analysis
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('corrections')}
                                                className={`px-3 py-1 text-xs font-bold border ${
                                                    activeTab === 'corrections'
                                                        ? 'border-slate-800 bg-slate-900 text-white'
                                                        : 'border-slate-300 bg-white text-slate-700'
                                                }`}
                                            >
                                                Corrections
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('model')}
                                                className={`px-3 py-1 text-xs font-bold border ${
                                                    activeTab === 'model'
                                                        ? 'border-slate-800 bg-slate-900 text-white'
                                                        : 'border-slate-300 bg-white text-slate-700'
                                                }`}
                                            >
                                                Model Answer
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            {activeTab === 'analysis' && (
                                                <div className="space-y-4 text-sm text-slate-700">
                                                    {activeWritingInsight.overallRemark?.trim() ? (
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                                                                AI Remark
                                                            </p>
                                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
                                                                <p className="text-sm leading-relaxed text-blue-900 font-medium italic">"{activeWritingInsight.overallRemark.trim()}"</p>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                    <div className="space-y-2 border-t border-slate-200 pt-3">
                                                        <p className="text-xs font-bold text-slate-500">Quick criterion read (/6 each)</p>
                                                        <p>
                                                            {criterionNote(
                                                                'Coherence / Meaning',
                                                                activeWritingInsight.coherence ?? activeWritingInsight.coherenceCohesion,
                                                            )}
                                                        </p>
                                                        <p>
                                                            {criterionNote(
                                                                'Vocabulary',
                                                                activeWritingInsight.vocabulary ?? activeWritingInsight.lexicalResource,
                                                            )}
                                                        </p>
                                                        <p>
                                                            {criterionNote(
                                                                'Readability',
                                                                activeWritingInsight.readability ?? activeWritingInsight.grammar,
                                                            )}
                                                        </p>
                                                        <p>
                                                            {criterionNote(
                                                                'Task fulfillment',
                                                                activeWritingInsight.taskFulfillment ?? activeWritingInsight.taskAchievement,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'corrections' && (
                                                <div className="space-y-3">
                                                    {insightLineFeedback.length > 0 ? (
                                                        insightLineFeedback.map((row, idx) => (
                                                            <div key={`lf-${idx}`} className="border border-slate-200 bg-slate-50 p-3 text-sm">
                                                                <p className="text-slate-700">
                                                                    <span className="font-bold">Original:</span> {row.original || '—'}
                                                                </p>
                                                                <p className="text-amber-700 mt-1">
                                                                    <span className="font-bold">Issue:</span> {row.issue || '—'}
                                                                </p>
                                                                <p className="text-emerald-700 mt-1">
                                                                    <span className="font-bold">Fix:</span> {row.fix || '—'}
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-slate-500">No correction lines available yet.</p>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'model' && (
                                                <div className="space-y-3">
                                                    {insightModelAnswer ? (
                                                        <div className="border border-indigo-200 bg-indigo-50/60 p-4">
                                                            <p className="whitespace-pre-wrap text-sm leading-6 text-indigo-900/90">
                                                                {insightModelAnswer}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500">Model answer is not ready yet.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActionMessage('Rewrite assistant will be available in the next update.')}
                                            className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            Rewrite My Answer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActionMessage('Band 9 improvement mode will be available in the next update.')}
                                            className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            Improve to Band 9
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActionMessage('Practice similar question will be available in the next update.')}
                                            className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            Practice Similar Question
                                        </button>
                                    </div>
                                </>
                            ) : null}
                            {actionMessage ? <p className="text-xs text-blue-700 font-semibold">{actionMessage}</p> : null}
                        </section>
                    )}

                    <section className="bg-blue-50 p-5 border border-blue-200 flex gap-4">
                        <Info className="w-8 h-8 text-blue-600 shrink-0" />
                        <div className="space-y-2">
                            <h4 className="font-black text-blue-900 text-lg tracking-tight">Targeted Improvement</h4>
                            <p className="text-blue-700/70 text-sm font-medium leading-relaxed">
                                Keep iterating on weaker module bands first. Use the next practice set in simulation mode once your practice mode scores stabilize.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TestResult;
