import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { AxiosError } from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    getWritingTask,
    autoSaveWriting,
    submitWriting,
    restoreWritingDraft,
    recordSimulationIntegrityEvents,
} from '../../services/writing.service';
import { Clock, Send, ChevronLeft, Save, AlertCircle, Loader2, AlertTriangle, Maximize2 } from 'lucide-react';

const SIM_TAB_SWITCH_MESSAGES: { title: string; body: string }[] = [
    {
        title: 'Notice (1 of 5)',
        body: 'You switched away from this test tab. Stay here during simulation — your timer is paused while you are away, and this event is logged.',
    },
    {
        title: 'Reminder (2 of 5)',
        body: 'Another tab switch was detected. Repeated switching may be treated as a test integrity risk. Please keep this tab in focus until you submit.',
    },
    {
        title: 'Warning (3 of 5)',
        body: 'You have left this tab multiple times. Focus on completing your response without further interruptions.',
    },
    {
        title: 'Strong warning (4 of 5)',
        body: 'Further tab switching may be reported with your attempt. Only use this window for your writing task.',
    },
    {
        title: 'Final warning (5 of 5)',
        body: 'This is the highest in-app warning level. Continued switching may invalidate your simulation attempt under your institution’s rules. Acknowledge to continue.',
    },
];

/** Cheap word count — no giant `split()` array for large pastes (avoids UI freezes). */
function wordCountApproximate(text: string): number {
    const s = text.trim();
    if (!s) return 0;
    let count = 0;
    let wasSpace = true;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i]!;
        const space = /\s/.test(ch);
        if (!space && wasSpace) count += 1;
        wasSpace = space;
    }
    return count;
}

function isAxiosSimulationWritingLock(err: unknown): err is AxiosError<{ code?: string; allowedWritingTask?: number }> {
    const ax = err as AxiosError<{ code?: string; allowedWritingTask?: number }>;
    const code = ax.response?.data?.code;
    return ax.response?.status === 409 && code === 'SIMULATION_WRITING_LOCK';
}

function isAxiosSimulationWritingComplete(err: unknown): boolean {
    const ax = err as AxiosError<{ code?: string }>;
    return ax.response?.status === 403 && ax.response?.data?.code === 'SIMULATION_WRITING_COMPLETE';
}

const WritingPlayer: React.FC = () => {
    const { setNumber, taskNumber } = useParams<{ setNumber: string; taskNumber: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isTask2 = Number(taskNumber) === 2;

    const sessionId = searchParams.get('sessionId') || '';
    const writingPreludeSeenKey = `writing-prelude-seen-${sessionId || `set-${setNumber}`}`;
    /** Stable list — a fresh `.split()` array every render was breaking `useCallback` / `useEffect` deps and caused an infinite `getWritingTask` loop. */
    const modulesParam =
        searchParams.get('modules') || localStorage.getItem('activeModules') || 'writing';
    const modules = useMemo(
        () => modulesParam.split(',').map((m) => m.trim()).filter(Boolean),
        [modulesParam],
    );
    const moduleOrder = modules;
    const writingModuleIndex = moduleOrder.indexOf('writing');
    /** undefined when this session is writing-only → last submit sends user to results. */
    const nextModuleAfterWriting = writingModuleIndex >= 0 ? moduleOrder[writingModuleIndex + 1] : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CMS task payload until shared WritingTask type exists
    const [task, setTask] = useState<any>(null);
    const [responseText, setResponseText] = useState('');
    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | ''>('');
    const [timeLeft, setTimeLeft] = useState(1620);
    const [wordCount, setWordCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inlineMessage, setInlineMessage] = useState<{ tone: 'error' | 'info'; text: string } | null>(null);
    /** 0=note, 1=instructions, 2=video, 3=simulation fullscreen gate, 4=editor */
    const [preludeStep, setPreludeStep] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [modePolicy, setModePolicy] = useState<{
        canRevisitTask?: boolean;
        canOverwriteSubmittedTask?: boolean;
    } | null>(null);
    const [sessionMode, setSessionMode] = useState<'practice' | 'simulation'>('practice');
    const [simulationFocusLossCount, setSimulationFocusLossCount] = useState(0);
    const [tabHidden, setTabHidden] = useState(false);
    const focusLossDebounceRef = useRef<number | null>(null);
    /** After a logged tab-hide, show escalating modal when the student returns (browsers cannot block other tabs). */
    const [tabReturnModal, setTabReturnModal] = useState<{ open: boolean; strike: number; totalLogged: number }>({
        open: false,
        strike: 1,
        totalLogged: 1,
    });
    const pendingTabAckRef = useRef<{ show: boolean; totalLogged: number } | null>(null);
    const tabHiddenAtMsRef = useRef<number | null>(null);
    const lastWindowBlurIntegrityRef = useRef(0);
    const userHadFullscreenRef = useRef(false);

    const navigateToAllowedWritingTask = useCallback(
        (allowed: number) => {
            navigate(
                `/test/writing/${setNumber}/${allowed}?sessionId=${sessionId}&modules=${modules.join(',')}`,
                { replace: true },
            );
        },
        [modules, navigate, sessionId, setNumber],
    );

    // Fetch Task & Restore Draft
    useEffect(() => {
        const loadTask = async () => {
            if (!setNumber || !taskNumber) return;
            try {
                const rawTaskData = await getWritingTask(Number(setNumber), Number(taskNumber));
                const taskObj = rawTaskData?.task ?? rawTaskData;
                if (rawTaskData?.testSet) {
                    taskObj.testSet = rawTaskData.testSet;
                }
                const policy = rawTaskData?.modePolicy ?? null;
                const sm = rawTaskData?.sessionMode === 'simulation' ? 'simulation' : 'practice';
                console.log('[DEBUG] WritingPlayer loadTask:', {
                    taskNumber,
                    hasTask: !!taskObj,
                    hasTestSet: !!rawTaskData?.testSet,
                    writingVideo: rawTaskData?.testSet?.instructions?.writingInstructionVideoUrl
                });
                setTask(taskObj);
                setModePolicy(policy);
                setSessionMode(sm);
                if (typeof rawTaskData?.simulationFocusLossCount === 'number') {
                    setSimulationFocusLossCount(rawTaskData.simulationFocusLossCount);
                }
                const preludeKey = `writing-prelude-seen-${sessionId || `set-${setNumber}`}`;
                const seen = localStorage.getItem(preludeKey);
                // If it's task 1, we show the module-level intros (preludeStep 0 and 1)
                // If it's task 2, we skip intros unless user hasn't seen them (unlikely if they came from task 1)
                if (Number(taskNumber) === 1) {
                    setPreludeStep(seen === 'editor' ? 4 : 0);
                } else {
                    setPreludeStep(4);
                }
                if (policy?.timeLimitSeconds) {
                    setTimeLeft(policy.timeLimitSeconds);
                }
                let draft: Awaited<ReturnType<typeof restoreWritingDraft>> = null;
                try {
                    draft = await restoreWritingDraft(Number(setNumber), Number(taskNumber));
                } catch (re) {
                    if (isAxiosSimulationWritingLock(re)) {
                        const allowed = re.response?.data?.allowedWritingTask;
                        if (typeof allowed === 'number') navigateToAllowedWritingTask(allowed);
                        return;
                    }
                    if (isAxiosSimulationWritingComplete(re)) {
                        navigate(`/results/${setNumber}?sessionId=${sessionId}`);
                        return;
                    }
                }
                if (draft) {
                    const dr = typeof draft.responseText === 'string' ? draft.responseText : '';
                    setResponseText(dr);
                    setWordCount(
                        Number.isFinite(Number(draft.wordCount)) && draft.wordCount !== undefined
                            ? Number(draft.wordCount)
                            : wordCountApproximate(dr)
                    );
                    setSelectedOption(draft.selectedOption === 'B' ? 'B' : draft.selectedOption === 'A' ? 'A' : '');
                }
            } catch (error) {
                if (isAxiosSimulationWritingLock(error)) {
                    const allowed = (error as AxiosError<{ allowedWritingTask?: number }>).response?.data
                        ?.allowedWritingTask;
                    if (typeof allowed === 'number') navigateToAllowedWritingTask(allowed);
                    return;
                }
                if (isAxiosSimulationWritingComplete(error)) {
                    navigate(`/results/${setNumber}?sessionId=${sessionId}`);
                    return;
                }
                console.error('Failed to load task', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTask();
    }, [setNumber, taskNumber, sessionId, navigate, navigateToAllowedWritingTask]);

    // Timer Logic (simulation: pause while tab is hidden)
    useEffect(() => {
        // Only run timer in the Editor (preludeStep 4)
        if (preludeStep !== 4 || timeLeft <= 0 || isSubmitting) return;
        if (sessionMode === 'simulation' && tabHidden) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isSubmitting, preludeStep, sessionMode, tabHidden]);

    useEffect(() => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        const sync = () => setTabHidden(document.visibilityState === 'hidden');
        sync();

        const flushPendingAckModal = () => {
            const p = pendingTabAckRef.current;
            if (!p?.show) return;
            pendingTabAckRef.current = null;
            const total = Math.max(1, p.totalLogged);
            const strike = Math.min(total, SIM_TAB_SWITCH_MESSAGES.length);
            setTabReturnModal({ open: true, strike, totalLogged: total });
        };

        const onVis = () => {
            const hidden = document.visibilityState === 'hidden';
            setTabHidden(hidden);

            if (!hidden) {
                const started = tabHiddenAtMsRef.current;
                tabHiddenAtMsRef.current = null;
                if (started != null && setNumber) {
                    const durationMs = Math.max(0, Date.now() - started);
                    void recordSimulationIntegrityEvents(Number(setNumber), [
                        {
                            kind: 'visibility_visible',
                            durationMs,
                            at: new Date().toISOString(),
                        },
                    ]).catch(() => {});
                }
                flushPendingAckModal();
                return;
            }

            tabHiddenAtMsRef.current = Date.now();
            if (!setNumber) return;
            if (focusLossDebounceRef.current) window.clearTimeout(focusLossDebounceRef.current);
            focusLossDebounceRef.current = window.setTimeout(() => {
                focusLossDebounceRef.current = null;
                void recordSimulationIntegrityEvents(Number(setNumber), [
                    {
                        kind: 'visibility_hidden',
                        at: new Date().toISOString(),
                        focused: typeof document.hasFocus === 'function' ? document.hasFocus() : undefined,
                    },
                ])
                    .then((r) => {
                        const total =
                            typeof r.simulationFocusLossCount === 'number' ? r.simulationFocusLossCount : 1;
                        setSimulationFocusLossCount(total);
                        pendingTabAckRef.current = { show: true, totalLogged: total };
                        if (document.visibilityState === 'visible') {
                            flushPendingAckModal();
                        }
                    })
                    .catch(() => {});
            }, 400);
        };
        document.addEventListener('visibilitychange', onVis);
        return () => {
            document.removeEventListener('visibilitychange', onVis);
            if (focusLossDebounceRef.current) window.clearTimeout(focusLossDebounceRef.current);
        };
    }, [sessionMode, preludeStep, setNumber]);

    useEffect(() => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        const onBlur = () => {
            if (Date.now() - lastWindowBlurIntegrityRef.current < 2000) return;
            lastWindowBlurIntegrityRef.current = Date.now();
            void recordSimulationIntegrityEvents(Number(setNumber), [
                { kind: 'window_blur', at: new Date().toISOString(), focused: false },
            ]).catch(() => {});
        };
        const onFocus = () => {
            if (Date.now() - lastWindowBlurIntegrityRef.current < 250) return;
            void recordSimulationIntegrityEvents(Number(setNumber), [
                {
                    kind: 'window_focus',
                    at: new Date().toISOString(),
                    focused: typeof document.hasFocus === 'function' ? document.hasFocus() : true,
                },
            ]).catch(() => {});
        };
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        return () => {
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
        };
    }, [sessionMode, preludeStep, setNumber]);

    useEffect(() => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        const onFs = () => {
            if (document.fullscreenElement) return;
            if (!userHadFullscreenRef.current) return;
            userHadFullscreenRef.current = false;
            void recordSimulationIntegrityEvents(Number(setNumber), [
                { kind: 'fullscreen_exit', at: new Date().toISOString() },
            ])
                .then((r) => {
                    if (typeof r.simulationFocusLossCount === 'number') {
                        setSimulationFocusLossCount(r.simulationFocusLossCount);
                    }
                })
                .catch(() => {});
        };
        document.addEventListener('fullscreenchange', onFs);
        return () => document.removeEventListener('fullscreenchange', onFs);
    }, [sessionMode, preludeStep, setNumber]);

    useEffect(() => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [sessionMode, preludeStep]);

    /** Debounced so huge pastes do not freeze the thread on every keystroke. */
    useEffect(() => {
        const t = window.setTimeout(() => setWordCount(wordCountApproximate(responseText)), 280);
        return () => window.clearTimeout(t);
    }, [responseText]);

    const performNavigateAfterWritingSubmit = useCallback(() => {
        if (Number(taskNumber) === 1) {
            navigate(`/test/writing/${setNumber}/2?sessionId=${sessionId}&modules=${modules.join(',')}`);
            return;
        }
        const order = modules.filter(Boolean);
        const writingIdx = order.indexOf('writing');
        const nextModule = order[writingIdx + 1];
        if (nextModule === 'speaking') {
            navigate(`/test/speaking/${setNumber}/1?sessionId=${sessionId}&modules=${modules.join(',')}`);
        } else if (nextModule === 'reading') {
            navigate(`/test/reading/${setNumber}?sessionId=${sessionId}&modules=${modules.join(',')}`);
        } else if (nextModule === 'listening') {
            navigate(`/test/listening/${setNumber}?sessionId=${sessionId}&modules=${modules.join(',')}`);
        } else {
            navigate(`/results/${setNumber}?sessionId=${sessionId}`);
        }
    }, [modules, navigate, sessionId, setNumber, taskNumber]);

    // Autosave Logic (every 30 seconds)
    useEffect(() => {
        const saver = setInterval(async () => {
            if (preludeStep === 4 && responseText.length > 10 && !isSubmitting) {
                setIsSaving(true);
                try {
                    await autoSaveWriting({
                        testSetNumber: Number(setNumber),
                        taskNumber: Number(taskNumber),
                        responseText,
                        wordCount: wordCountApproximate(responseText),
                        selectedOption: selectedOption || undefined,
                    });
                } catch (e) {
                    if (isAxiosSimulationWritingLock(e)) {
                        const allowed = (e as AxiosError<{ allowedWritingTask?: number }>).response?.data
                            ?.allowedWritingTask;
                        if (typeof allowed === 'number') navigateToAllowedWritingTask(allowed);
                    } else {
                        console.error('Autosave failed', e);
                    }
                } finally {
                    setTimeout(() => setIsSaving(false), 2000);
                }
            }
        }, 30000);
        return () => clearInterval(saver);
    }, [responseText, selectedOption, setNumber, taskNumber, isSubmitting, preludeStep, navigateToAllowedWritingTask]);

    const handleSubmit = async () => {
        if (responseText.length < 50) {
            setInlineMessage({ tone: 'error', text: 'Response is too short. Please write at least 50 characters.' });
            return;
        }
        setInlineMessage(null);

        setIsSubmitting(true);
        try {
            await submitWriting({
                testSetNumber: Number(setNumber),
                taskNumber: Number(taskNumber),
                responseText,
                wordCount: wordCountApproximate(responseText),
                timeTaken: 1620 - timeLeft,
                selectedOption: selectedOption || undefined
            });
            performNavigateAfterWritingSubmit();
        } catch (error) {
            if (isAxiosSimulationWritingLock(error)) {
                const allowed = (error as AxiosError<{ allowedWritingTask?: number }>).response?.data
                    ?.allowedWritingTask;
                if (typeof allowed === 'number') {
                    setInlineMessage({
                        tone: 'info',
                        text: `Redirecting to Task ${allowed} (simulation order).`,
                    });
                    navigateToAllowedWritingTask(allowed);
                    return;
                }
            }
            if (isAxiosSimulationWritingComplete(error)) {
                navigate(`/results/${setNumber}?sessionId=${sessionId}`);
                return;
            }
            console.error('Submission failed', error);
            setInlineMessage({ tone: 'error', text: 'Submission failed. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const primarySubmitIdleLabel = () => {
        const tn = Number(taskNumber);
        if (!Number.isFinite(tn)) return 'Finish task';
        if (tn === 1) return 'Submit Task 1 & continue';
        if (tn === 2) {
            return nextModuleAfterWriting ? 'Submit Task 2 & continue' : 'Submit Task 2 & view results';
        }
        return 'Finish task';
    };

    const backgroundText = String(task?.scenario?.backgroundParagraph ?? '').trim();
    const surveyTopic = String(task?.surveyTopic ?? '').trim();
    const instructionLines: string[] = useMemo(() => {
        const raw = task?.scenario?.taskInstructions;
        let text = '';
        if (Array.isArray(raw)) {
            text = raw.join('\n');
        } else if (typeof raw === 'string') {
            text = raw;
        }

        if (!text.trim()) return [];

        // 1. Identify and separate the standard intro header if present
        // "Write an email... following things:"
        const introRegex = /^(.*?should do the following things:)\s*/i;
        const introMatch = text.match(introRegex);
        const contentBody = introMatch ? text.slice(introMatch[0].length) : text;

        // 2. Split body by multiple delimiters: Newlines, bullets, numbers, or standard CELPIP verbs
        // Verbs often used in bullets: Describe, Explain, Request, Suggest, Give, Choose, State, Outline, Provide
        const splitRegex = /\n|•|\(\d+\)|\d+\.|\d+\)|(?=\b(?:Describe|Explain|Request|Suggest|Give|Choose|State|Outline|Provide)\b)/;
        
        return contentBody
            .split(splitRegex)
            .map((s) => s.trim())
            .filter((s) => s.length > 3); // Filter out very short fragments or empty strings
    }, [task?.scenario?.taskInstructions]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-black text-slate-900 mb-2">Task Not Found</h1>
                <p className="text-slate-500 mb-8">The writing task you are looking for does not exist or has been removed.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Dashboard</button>
            </div>
        );
    }

    const goToTask = (targetTask: number) => {
        navigate(`/test/writing/${setNumber}/${targetTask}?sessionId=${sessionId}&modules=${modules.join(',')}`);
    };

    const onPasteSimulation = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        e.preventDefault();
        setInlineMessage({
            tone: 'error',
            text: 'Paste is disabled in simulation mode. Type your response in your own words.',
        });
        void recordSimulationIntegrityEvents(Number(setNumber), [
            { kind: 'paste_blocked', at: new Date().toISOString() },
        ]).catch(() => {});
    };

    const onCopySimulation = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        e.preventDefault();
        setInlineMessage({
            tone: 'error',
            text: 'Copy is disabled in simulation mode.',
        });
    };

    const onCutSimulation = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (sessionMode !== 'simulation' || preludeStep < 3) return;
        e.preventDefault();
        setInlineMessage({
            tone: 'error',
            text: 'Cut is disabled in simulation mode.',
        });
    };

    const leaveWriting = () => {
        if (sessionMode === 'simulation' && preludeStep === 2) {
            if (!window.confirm('Leave the simulation setup? You can resume this test from your dashboard later.')) {
                return;
            }
            navigate('/dashboard');
            return;
        }
        if (sessionMode === 'simulation' && preludeStep === 4) {
            if (document.hidden) {
                setTabHidden(true);
            }
        }
        if (sessionMode === 'simulation' && preludeStep === 4) {
            const strikes = simulationFocusLossCount;
            if (
                !window.confirm(
                    'Leave the simulation writing screen? Your progress is auto-saved, but leaving may be flagged on your attempt.',
                )
            ) {
                return;
            }
            if (strikes >= 2) {
                if (
                    !window.confirm(
                        'Second step: You already have tab-switch events logged. Are you sure you want to leave?',
                    )
                ) {
                    return;
                }
            }
            if (strikes >= 4) {
                if (
                    !window.confirm(
                        'Final step: Multiple integrity signals were recorded. Leaving now may affect how this attempt is reviewed. Leave anyway?',
                    )
                ) {
                    return;
                }
            }
        }
        navigate('/dashboard');
    };

    const CelpipTopBar = () => (
        <header className="w-full h-[60px] bg-[#1a6faf] flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center shrink-0">
                        <span className="text-white font-black text-xl leading-none">L</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-[16px] font-black tracking-tight leading-none uppercase">LetsCrack</span>
                        <span className="text-white/80 text-[9px] font-bold tracking-[0.2em] mt-0.5 uppercase">Writing Test</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <button 
                    onClick={leaveWriting}
                    className="text-white hover:text-white/80 text-[12px] font-bold transition-all duration-200 uppercase tracking-widest flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Exit Test
                </button>
            </div>
        </header>
    );

    const handleBackStep = () => {
        if (preludeStep === 0) {
            leaveWriting();
        } else if (preludeStep === 4) {
            if (Number(taskNumber) === 2) {
                const baseUrl = window.location.pathname.split('/test/writing/')[1]?.split('?')[0];
                const setNum = baseUrl?.split('/')[0];
                if (setNum) {
                    navigate(`/test/writing/${setNum}/1${window.location.search}`);
                    return;
                }
            }
            leaveWriting();
        } else {
            setPreludeStep((s) => (s - 1) as any);
        }
    };

    const renderContent = () => {
        switch (preludeStep) {
            case 0: {
                const sessionInstructions = (sessionMode === 'simulation' 
                    ? task?.testSet?.instructions?.simulation || ''
                    : task?.testSet?.instructions?.practice || '').trim();
                
                return (
                    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                        <div className="flex items-start gap-3 mb-6">
                            <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                <span className="font-serif italic font-bold text-[10px]">i</span>
                            </div>
                            <h3 className="text-[14px] font-bold text-[#1a6faf]">Writing Test Instructions</h3>
                        </div>
                        <div className="space-y-6 text-[#333] leading-relaxed max-w-2xl ml-7 text-[13px]">
                            {sessionInstructions.split('\n').map((line, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#adb5bd] mt-1.5 shrink-0" />
                                    <p dangerouslySetInnerHTML={{ 
                                        __html: line.replace(/(\d+ minutes|NEXT|here)/g, '<span class="font-bold text-[#111]">$1</span>') 
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            case 1: {
                const introText = (task?.testSet?.instructions?.writingInstructionText || '').trim();
                return (
                    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                        <div className="flex items-start gap-3 mb-6">
                            <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                <span className="font-serif italic font-bold text-[10px]">i</span>
                            </div>
                            <h3 className="text-[14px] font-bold text-[#1a6faf]">Writing Instructional Information</h3>
                        </div>
                        <div className="max-w-2xl ml-7 text-[#333] space-y-4 text-[13px] leading-relaxed">
                            {introText.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                );
            }
            case 2: {
                const introVideo = (task?.testSet?.instructions?.writingInstructionVideoUrl || '').trim();
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
                        <div className="w-full max-w-[600px] aspect-video bg-black border border-[#ced4da] shadow-md mb-8">
                            <video src={introVideo} controls className="h-full w-full" />
                        </div>
                        <button 
                            onClick={() => setPreludeStep(sessionMode === 'simulation' ? 3 : 4)}
                            className="bg-[#1a6faf] text-white text-[13px] font-bold px-12 py-3 hover:bg-[#1565a8] uppercase transition-all rounded-none"
                        >
                            Skip
                        </button>
                    </div>
                );
            }
            case 3: {
                const handleEnterFullscreen = async () => {
                    try {
                        if (document.documentElement.requestFullscreen) {
                            await document.documentElement.requestFullscreen();
                        }
                        userHadFullscreenRef.current = true;
                    } catch {}
                    setPreludeStep(4);
                };
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="bg-[#1a6faf]/5 w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-[#1a6faf]/10">
                            <div className="bg-[#1a6faf] text-white rounded-full w-10 h-10 flex items-center justify-center">
                                <span className="font-serif italic font-bold text-2xl mt-0.5">i</span>
                            </div>
                        </div>
                        <h2 className="text-[20px] font-bold text-[#111] mb-4 tracking-tight">Full-Screen Mode Required</h2>
                        <p className="text-[14px] text-[#555] leading-relaxed max-w-md">
                            To maintain test integrity and simulate the real exam environment, 
                            please enter <span className="text-[#1a6faf] font-bold">Fullscreen Mode</span> to begin your writing task.
                        </p>
                        <div className="mt-10 flex gap-4">
                            <button 
                                onClick={handleEnterFullscreen} 
                                className="bg-[#1a6faf] text-white text-[13px] font-bold px-10 py-3 hover:bg-[#1565a8] uppercase transition-all rounded-none"
                            >
                                Enter Fullscreen
                            </button>
                            <button 
                                onClick={() => setPreludeStep(4)} 
                                className="text-[#666] text-[13px] font-bold px-6 py-3 hover:text-[#111] uppercase transition-all"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                );
            }
            case 4: {
                return (
                    <main className="flex-1 flex overflow-hidden">
                        {/* LEFT COLUMN: Information - Light Grey Tone */}
                        <div className={`w-[45%] flex flex-col bg-[#f8f9fa] p-6 overflow-y-auto ${scrollbarHideClass}`}>
                            <div className="flex items-start gap-2.5 mb-5">
                                <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                    <span className="font-serif italic font-bold text-[10px]">i</span>
                                </div>
                                <h3 className="text-[14px] font-bold text-[#1a6faf]">Read the following information.</h3>
                            </div>
                            
                            <div className="text-[13px] leading-[1.6] text-[#333] space-y-4 mb-8">
                                <div className="whitespace-pre-wrap">{backgroundText || surveyTopic}</div>
                            </div>

                            <div className="mt-auto">
                                <button className="w-full border border-[#eee] py-3 px-6 text-[13px] font-medium text-[#888] hover:bg-[#fcfcfc] transition-colors text-center bg-white shadow-none rounded-none leading-tight">
                                    Click here to view sample responses.
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Input area - Light Blue Background */}
                        <div className={`flex-1 flex flex-col bg-[#eef3f7] border-l border-[#d1dfea] p-6 overflow-y-auto ${scrollbarHideClass}`}>
                            {isTask2 ? (
                                <div className="space-y-5">
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                            <span className="font-serif italic font-bold text-[10px]">i</span>
                                        </div>
                                        <h3 className="text-[14px] font-bold text-[#1a6faf]">
                                            Choose the option that you prefer. Why do you prefer your choice? Explain the reasons for your choice. Write about 150–200 words.
                                        </h3>
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="surveyOption"
                                                checked={selectedOption === 'A'}
                                                onChange={() => setSelectedOption('A')}
                                                className="mt-1 w-3.5 h-3.5 text-[#1a6faf] border-[#ccc] focus:ring-0"
                                            />
                                            <span className="text-[13px] text-[#333] leading-tight">
                                                <span className="font-bold">Option A:</span> {task.optionA}
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="surveyOption"
                                                checked={selectedOption === 'B'}
                                                onChange={() => setSelectedOption('B')}
                                                className="mt-1 w-3.5 h-3.5 text-[#1a6faf] border-[#ccc] focus:ring-0"
                                            />
                                            <span className="text-[13px] text-[#333] leading-tight">
                                                <span className="font-bold">Option B:</span> {task.optionB}
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex items-start gap-2.5 pt-2">
                                        <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                            <span className="font-serif italic font-bold text-[10px]">i</span>
                                        </div>
                                        <h3 className="text-[14px] font-bold text-[#1a6faf]">
                                            Explain the reasons for your choice. Write about 150–200 words.
                                        </h3>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            onPaste={onPasteSimulation}
                                            disabled={!selectedOption}
                                            className="w-full min-h-[300px] resize-none border border-[#c1d1e0] p-4 text-[14px] focus:outline-none focus:border-[#1a6faf] font-normal leading-relaxed text-[#333] bg-white disabled:bg-white/50 disabled:cursor-not-allowed shadow-sm"
                                            placeholder={selectedOption ? `Explain why you chose Option ${selectedOption}...` : "Please select an option first."}
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-[#708090] font-medium mt-1">
                                            <div>Words: <span className="font-bold text-[#1a6faf]">{wordCount}</span></div>
                                            {isSaving && <span className="animate-pulse uppercase tracking-wider text-[9px]">Syncing...</span>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                                            <span className="font-serif italic font-bold text-[10px]">i</span>
                                        </div>
                                        <h3 className="text-[12.5px] font-bold text-[#1a6faf] leading-tight">
                                            {(() => {
                                                const raw = task?.scenario?.taskInstructions;
                                                const text = Array.isArray(raw) ? raw.join('\n') : String(raw || '');
                                                return text.match(/^(.*?should do the following things:)/i)?.[0] || 
                                                       "Write an email in about 150–200 words. Your email should do the following things:";
                                            })()}
                                        </h3>
                                    </div>

                                    <div className="px-1">
                                        <ul className="space-y-2 text-[12px] text-[#333] ml-5 list-disc marker:text-[#1a6faf]">
                                            {instructionLines.map((inst, i) => (
                                                <li key={i}>{inst}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-1">
                                        <textarea
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            onPaste={onPasteSimulation}
                                            className="w-full min-h-[300px] resize-none border border-[#c1d1e0] p-4 text-[14px] focus:outline-none focus:border-[#1a6faf] font-normal leading-relaxed text-[#333] bg-white shadow-sm"
                                            placeholder="Type your email here..."
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-[#708090] font-medium mt-1">
                                            <div>Words: <span className="font-bold text-[#1a6faf]">{wordCount}</span></div>
                                            {isSaving && <span className="animate-pulse uppercase tracking-wider text-[9px]">Syncing...</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-4">
                                <p className="text-[11px] text-[#708090] font-medium italic">
                                    * NOTE: This practice test is not recording your response.
                                </p>
                            </div>
                        </div>
                    </main>
                );
            }
        }
    };

    const headerTitle = () => {
        if (preludeStep === 0) return `Practice Test ${setNumber} - Writing Instructions`;
        if (preludeStep === 1) return `Practice Test ${setNumber} - Instructional Text`;
        if (preludeStep === 2) return `Practice Test ${setNumber} - Instructional Video`;
        if (preludeStep === 3) return `Practice Test ${setNumber} - Simulation Protocol`;
        return `Practice Test ${setNumber} - Writing Task ${taskNumber}: ${isTask2 ? 'Responding to Survey Questions' : 'Writing an Email'}`;
    };

    // Helper for hiding scrollbars
    const scrollbarHideClass = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

    const handleNext = () => {
        if (preludeStep < 4) {
            if (preludeStep === 2 && sessionMode !== 'simulation') {
                // Skip simulation protocol if in practice mode
                setPreludeStep(4);
            } else {
                setPreludeStep((s) => (s + 1) as any);
            }
        } else {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans overflow-y-auto">
            <CelpipTopBar />
            
            <div className="flex-1 flex items-start justify-center p-4 py-4">
                <div className="w-full max-w-[850px] min-h-[650px] bg-white border border-[#ced4da] shadow-sm flex flex-col relative overflow-hidden">
                    {/* CELPIP Unified Header */}
                    <header className="h-[44px] bg-[#e8eaed] border-b border-[#ced4da] px-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-normal text-[#333]">
                                {headerTitle()}
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            {preludeStep === 4 && (
                                <div className="text-[13px] text-[#555]">
                                    Time remaining: <span className="font-bold text-[#111]">{formatTime(timeLeft)}</span>
                                </div>
                            )}
                            <button 
                                onClick={handleNext}
                                disabled={isSubmitting || (preludeStep === 4 && timeLeft <= 0)}
                                className="bg-[#1a6faf] text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-center hover:bg-[#1565a8] uppercase disabled:opacity-50 transition-colors rounded-none"
                            >
                                Next
                            </button>
                        </div>
                    </header>

                    {/* Content Area - Constrained for internal scrolling */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {renderContent()}
                    </div>

                    {/* CELPIP Unified Footer */}
                    <footer className="h-[44px] bg-[#e8eaed] border-t border-[#ced4da] flex items-center justify-end px-4 shrink-0">
                        <button 
                            onClick={handleBackStep}
                            className="bg-[#1a6faf] text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-center hover:bg-[#1565a8] uppercase transition-colors rounded-none"
                        >
                            Back
                        </button>
                    </footer>
                </div>
            </div>

            {sessionMode === 'simulation' && tabReturnModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
                    <div className="w-[500px] max-w-[95vw] bg-white border border-[#ced4da] shadow-2xl overflow-hidden flex flex-col">
                        <div className="h-11 bg-[#e8eaed] border-b border-[#ced4da] px-6 flex items-center shrink-0">
                            <span className="text-[16px] font-bold text-[#1a6faf]">Integrity Alert</span>
                        </div>
                        <div className="p-8 text-[14px] text-[#444] leading-relaxed font-medium">
                            {SIM_TAB_SWITCH_MESSAGES[tabReturnModal.strike - 1]?.body}
                        </div>
                        <div className="h-14 bg-[#f8f9fa] border-t border-[#ced4da] px-6 flex items-center justify-end shrink-0">
                            <button 
                                onClick={() => setTabReturnModal((m) => ({ ...m, open: false }))}
                                className="bg-[#1a6faf] text-white text-[12px] font-bold px-10 h-full flex items-center justify-center uppercase border-none rounded-none"
                                style={{ marginRight: '-24px' }}
                            >
                                Resume Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default WritingPlayer;
