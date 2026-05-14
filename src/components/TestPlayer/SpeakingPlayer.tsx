import React, { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { getSpeakingTask, saveSpeakingRecording } from "../../services/speaking.service"
import { getResultStatus } from "../../services/test.service"
import { recordSimulationIntegrityEvents } from "../../services/writing.service"
import { Clock, Mic, ChevronLeft, Loader2, Mic2, Square, AlertTriangle, Send, AlertCircle, Maximize2 } from "lucide-react"

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
    body: 'Further tab switching may be reported with your attempt. Only use this window for your speaking task.',
  },
  {
    title: 'Final warning (5 of 5)',
    body: 'This is the highest in-app warning level. Continued switching may invalidate your simulation attempt under your institution’s rules. Acknowledge to continue.',
  },
];

interface SpeakingTask {
  prompt?: string
  introInstruction?: string
  speakingIntroVideoUrl?: string
  task5IntroVideoUrl?: string
  instructionVideoUrl?: string
  imageUrl?: string
  imageUrlA?: string
  imageUrlB?: string
  imageUrlC?: string
  optionALabel?: string
  optionBLabel?: string
  optionCLabel?: string
  prepTime?: number
  speakingTime?: number
  subTask?: string | null
  totalSpeakingTasks?: number
  positionInSet?: number
  testSet?: any
}

const SpeakingPlayer: React.FC = () => {
  const { setNumber, taskNumber } = useParams<{ setNumber: string; taskNumber: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get("sessionId") || localStorage.getItem("activeSessionId") || ""
  const modulesParam = searchParams.get("modules") || localStorage.getItem("activeModules") || "speaking"
  const modules = useMemo(() => modulesParam.split(","), [modulesParam])

  const tn = Number(taskNumber)
  const sub5: "A" | "B" | null = useMemo(() => {
    if (tn !== 5) return null
    return searchParams.get("subTask") === "B" ? "B" : "A"
  }, [tn, searchParams])

  const [task, setTask] = useState<SpeakingTask | null>(null)
  const [selected5AOption, setSelected5AOption] = useState<"A" | "B" | "C" | null>(null)
  const [phase, setPhase] = useState<"loading" | "intro" | "preparing" | "recording" | "submitting" | "done">("loading")
  const [timeLeft, setTimeLeft] = useState(0)
  const [inlineMessage, setInlineMessage] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [volume, setVolume] = useState(0)

  // Simulation Integrity
  const [tabHidden, setTabHidden] = useState(false);
  const [simulationFocusLossCount, setSimulationFocusLossCount] = useState(0);
  const [tabReturnModal, setTabReturnModal] = useState<{ open: boolean; strike: number; totalLogged: number }>({
    open: false,
    strike: 1,
    totalLogged: 1,
  });
  const pendingTabAckRef = useRef<{ show: boolean; totalLogged: number } | null>(null);
  const tabHiddenAtMsRef = useRef<number | null>(null);
  const lastWindowBlurIntegrityRef = useRef(0);
  const userHadFullscreenRef = useRef(false);

  function setupVisualizer(stream: MediaStream) {
    const AudioContextCtor =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return
    const audioContext = new AudioContextCtor()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    analyser.fftSize = 256
    audioContextRef.current = audioContext
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      setVolume(sum / bufferLength)
      animationFrameRef.current = requestAnimationFrame(updateVolume)
    }
    updateVolume()
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const introSeenKey = `speaking-intro-seen-${sessionId || `set-${setNumber}`}`
  const task5IntroSeenKey = `speaking-task5-intro-seen-${sessionId || `set-${setNumber}`}`
  const [preludeStep, setPreludeStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const sessionMode = searchParams.get("mode") || localStorage.getItem("activeMode") || "practice";

  useEffect(() => {
    const loadTask = async () => {
      if (!setNumber || !taskNumber || !Number.isFinite(tn)) return
      setPhase("loading")
      try {
        const data = await getSpeakingTask(Number(setNumber), tn, tn === 5 ? sub5 : null)
        setTask(data)
        setSelected5AOption(null)
        const needsSpeakingIntro = tn === 1 && !localStorage.getItem(introSeenKey)
        const needsTask5Intro = tn === 5 && sub5 === "A" && !localStorage.getItem(task5IntroSeenKey)
        
        if (needsSpeakingIntro || needsTask5Intro) {
          setPhase("intro")
          setPreludeStep(tn === 1 ? 0 : 1);
        } else {
          setPreludeStep(4);
          setTimeLeft(data.prepTime ?? 30)
          setPhase("preparing")
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setupVisualizer(stream)
        } catch (micErr) {
          console.error("Initial mic check failed", micErr)
          setInlineMessage("Please ensure microphone permissions are allowed.")
        }
      } catch (error) {
        console.error("Failed to load speaking task", error)
        setInlineMessage("Failed to load task. Please refresh.")
        setPhase("done")
      }
    }
    void loadTask()
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) void audioContextRef.current.close()
    }
  }, [introSeenKey, setNumber, sub5, task5IntroSeenKey, taskNumber, tn])

  // Simulation Integrity Hooks
  useEffect(() => {
    if (sessionMode !== 'simulation' || phase === 'loading' || phase === 'intro') return;
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
            { kind: 'visibility_visible', durationMs, at: new Date().toISOString() },
          ]).catch(() => {});
        }
        flushPendingAckModal();
        return;
      }
      tabHiddenAtMsRef.current = Date.now();
      if (!setNumber) return;
      const timeoutId = window.setTimeout(() => {
        void recordSimulationIntegrityEvents(Number(setNumber), [
          { kind: 'visibility_hidden', at: new Date().toISOString() },
        ])
          .then((r) => {
            const total = typeof r.simulationFocusLossCount === 'number' ? r.simulationFocusLossCount : 1;
            setSimulationFocusLossCount(total);
            pendingTabAckRef.current = { show: true, totalLogged: total };
            if (document.visibilityState === 'visible') flushPendingAckModal();
          })
          .catch(() => {});
      }, 400);
      return () => window.clearTimeout(timeoutId);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [sessionMode, phase, setNumber]);

  useEffect(() => {
    if (sessionMode !== 'simulation' || phase === 'loading' || phase === 'intro') return;
    const onBlur = () => {
      if (Date.now() - lastWindowBlurIntegrityRef.current < 2000) return;
      lastWindowBlurIntegrityRef.current = Date.now();
      void recordSimulationIntegrityEvents(Number(setNumber), [
        { kind: 'window_blur', at: new Date().toISOString() },
      ]).catch(() => {});
    };
    const onFocus = () => {
      if (Date.now() - lastWindowBlurIntegrityRef.current < 250) return;
      void recordSimulationIntegrityEvents(Number(setNumber), [
        { kind: 'window_focus', at: new Date().toISOString() },
      ]).catch(() => {});
    };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [sessionMode, phase, setNumber]);

  useEffect(() => {
    if (sessionMode !== 'simulation' || phase === 'loading' || phase === 'intro') return;
    const onFs = () => {
      if (document.fullscreenElement) return;
      if (!userHadFullscreenRef.current) return;
      userHadFullscreenRef.current = false;
      void recordSimulationIntegrityEvents(Number(setNumber), [
        { kind: 'fullscreen_exit', at: new Date().toISOString() },
      ])
        .then((r) => {
          if (typeof r.simulationFocusLossCount === 'number') setSimulationFocusLossCount(r.simulationFocusLossCount);
        })
        .catch(() => {});
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [sessionMode, phase, setNumber]);

  // Timer
  useEffect(() => {
    if (phase === "done" || phase === "loading" || phase === "submitting" || preludeStep < 4) return
    if (sessionMode === "simulation" && tabHidden) return;

    if (timeLeft <= 0) {
      if (phase === "preparing") {
        if (tn === 5 && sub5 === "A") {
          const q = new URLSearchParams()
          q.set("sessionId", sessionId)
          q.set("modules", modules.join(","))
          q.set("subTask", "B")
          navigate(`/test/speaking/${setNumber}/5?${q.toString()}`)
          return
        }
        window.setTimeout(() => {
          void (async () => {
            try {
              // Play AI voice prompt and wait for it to finish (max 3 seconds)
              await new Promise<void>((resolve) => {
                const utterance = new SpeechSynthesisUtterance("Start speaking now.");
                utterance.onend = () => resolve();
                utterance.onerror = () => resolve();
                window.speechSynthesis.speak(utterance);
                setTimeout(resolve, 3000);
              });
              
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
              const mediaRecorder = new MediaRecorder(stream)
              mediaRecorderRef.current = mediaRecorder
              chunksRef.current = []
              mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
              mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                void (async () => {
                  setPhase("submitting")
                  try {
                    const formData = new FormData()
                    formData.append("audioFile", blob, `speaking_${taskNumber}.webm`)
                    formData.append("testSetNumber", setNumber || "1")
                    formData.append("taskNumber", taskNumber || "1")
                    if (tn === 5) formData.append("subTask", sub5 || "A")
                    formData.append("duration", String(task?.speakingTime || 60))
                    await saveSpeakingRecording(formData)

                    if (sessionId) {
                      const status = await getResultStatus(sessionId)
                      if (status.status === "graded" || status.progress.overall.submitted >= status.progress.overall.total) {
                        navigate(`/results/${setNumber}?sessionId=${sessionId}`)
                        return
                      }
                      if (status.progress.speaking.submitted >= status.progress.speaking.total) {
                        const moduleOrder = modules.filter(Boolean)
                        const speakingIdx = moduleOrder.indexOf("speaking")
                        const nextModule = moduleOrder[speakingIdx + 1]
                        if (nextModule === "reading") { navigate(`/test/reading/${setNumber}?sessionId=${sessionId}&modules=${modules.join(",")}`); return; }
                        if (nextModule === "listening") { navigate(`/test/listening/${setNumber}?sessionId=${sessionId}&modules=${modules.join(",")}`); return; }
                        if (nextModule === "writing") { navigate(`/test/writing/${setNumber}/1?sessionId=${sessionId}&modules=${modules.join(",")}`); return; }
                        navigate(`/results/${setNumber}?sessionId=${sessionId}`); return;
                      }
                    }
                    const q = new URLSearchParams()
                    q.set("sessionId", sessionId)
                    q.set("modules", modules.join(","))
                    if (tn === 5 && sub5 === "A") { 
                      const chosenKey = selected5AOption || (["A", "B"] as const)[Math.floor(Math.random() * 2)];
                      const myChoice = {
                        imageUrl: chosenKey === "A" ? task?.imageUrlA : task?.imageUrlB,
                        label: chosenKey === "A" ? task?.optionALabel : task?.optionBLabel
                      };
                      const sisterChoice = {
                        imageUrl: task?.imageUrlC,
                        label: task?.optionCLabel
                      };
                      localStorage.setItem(`test_${setNumber}_task5_choices`, JSON.stringify({ myChoice, sisterChoice }));
                      q.set("subTask", "B"); navigate(`/test/speaking/${setNumber}/5?${q.toString()}`); return; 
                    }
                    if (tn === 5 && sub5 === "B") { navigate(`/test/speaking/${setNumber}/6?${q.toString()}`); return; }
                    const next = tn + 1
                    if (next <= 8) navigate(`/test/speaking/${setNumber}/${next}?${q.toString()}`)
                    else navigate(sessionId ? `/results/${setNumber}?sessionId=${sessionId}` : "/dashboard")
                  } catch (error) {
                    console.error("Failed to upload recording", error)
                    setInlineMessage("Upload failed. Please check your connection.")
                    setPhase("done")
                  }
                })()
              }
              mediaRecorder.start()
              setPhase("recording")
              setTimeLeft(task?.speakingTime || 60)
            } catch (err) {
              console.error("Mic access denied", err)
              setInlineMessage("Microphone access is required for this task. It was denied.")
              setPhase("done")
            }
          })()
        }, 0)
      } else if (phase === "recording") {
        window.setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop()
          const utterance = new SpeechSynthesisUtterance("Time is up.");
          window.speechSynthesis.speak(utterance);
        }, 0)
      }
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [modules, navigate, phase, sessionId, setNumber, sub5, task?.speakingTime, taskNumber, tn, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const labelTask = tn === 5 ? `5${sub5 || "A"}` : String(tn)
  const total = task?.totalSpeakingTasks ?? 9
  const pos = task?.positionInSet ?? tn
  const isTask5A = tn === 5 && sub5 === "A"
  const hasTask5AOptions = Boolean(isTask5A && (task?.imageUrlA?.trim() || task?.imageUrlB?.trim() || task?.imageUrlC?.trim()))

  const startFromIntro = () => {
    if (tn === 1) localStorage.setItem(introSeenKey, "1")
    if (tn === 5 && sub5 === "A") localStorage.setItem(task5IntroSeenKey, "1")
    setTimeLeft(task?.prepTime ?? 30)
    setPhase("preparing")
    setPreludeStep(4);
  }

  const handleBackStep = () => {
    if (preludeStep === 0 || preludeStep === 4 || (preludeStep === 1 && tn === 5)) navigate("/dashboard")
    else setPreludeStep((s) => (s - 1) as any)
  };

  const handleNext = () => {
    if (preludeStep < 4) {
      if (preludeStep === 2 && sessionMode !== 'simulation') startFromIntro()
      else if (preludeStep === 3) startFromIntro()
      else setPreludeStep((s) => (s + 1) as any)
    } else if (preludeStep === 4) {
      if (phase === "preparing" || phase === "recording") {
        setTimeLeft(0);
      } else if (phase === "done") {
        const q = new URLSearchParams()
        q.set("sessionId", sessionId)
        q.set("modules", modules.join(","))
        if (tn === 5 && sub5 === "A") { 
          const chosenKey = selected5AOption || (["A", "B"] as const)[Math.floor(Math.random() * 2)];
          const myChoice = {
            imageUrl: chosenKey === "A" ? task?.imageUrlA : task?.imageUrlB,
            label: chosenKey === "A" ? task?.optionALabel : task?.optionBLabel
          };
          const sisterChoice = {
            imageUrl: task?.imageUrlC,
            label: task?.optionCLabel
          };
          localStorage.setItem(`test_${setNumber}_task5_choices`, JSON.stringify({ myChoice, sisterChoice }));
          q.set("subTask", "B"); navigate(`/test/speaking/${setNumber}/5?${q.toString()}`); return; 
        }
        if (tn === 5 && sub5 === "B") { navigate(`/test/speaking/${setNumber}/6?${q.toString()}`); return; }
        const next = tn + 1
        if (next <= 8) navigate(`/test/speaking/${setNumber}/${next}?${q.toString()}`)
        else navigate(sessionId ? `/results/${setNumber}?sessionId=${sessionId}` : "/dashboard")
      }
    }
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
            <span className="text-white/80 text-[9px] font-bold tracking-[0.2em] mt-0.5 uppercase">Speaking Test</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button onClick={() => navigate("/dashboard")} className="text-white hover:text-white/80 text-[12px] font-bold transition-all duration-200 uppercase tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Exit Test
        </button>
      </div>
    </header>
  );

  const headerTitle = () => {
    if (preludeStep === 0) return `Practice Test ${setNumber} - Speaking Instructions`;
    if (preludeStep === 1) return `Practice Test ${setNumber} - Instructional Text`;
    if (preludeStep === 2) return `Practice Test ${setNumber} - Instructional Video`;
    if (preludeStep === 3) return `Practice Test ${setNumber} - Simulation Protocol`;
    return `Practice Test ${setNumber} - Speaking Task ${labelTask}`;
  };

  const renderContent = () => {
    const scrollbarHideClass = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";
    switch (preludeStep) {
      case 0: {
        const sessionInstructions = (sessionMode === 'simulation' ? task?.testSet?.instructions?.simulation || '' : task?.testSet?.instructions?.practice || '').trim();
        return (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="flex items-start gap-2.5 mb-6">
              <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                <span className="font-serif italic font-bold text-[10px]">i</span>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a6faf]">Speaking Test Instructions</h3>
            </div>
            <div className="space-y-6 text-[#333] leading-relaxed max-w-2xl ml-7 text-[13px]">
              {sessionInstructions.split('\n').map((line, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#adb5bd] mt-1.5 shrink-0" />
                  <p dangerouslySetInnerHTML={{ __html: line.replace(/(\d+ minutes|NEXT|here)/g, '<span class="font-bold text-[#111]">$1</span>') }} />
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 1: {
        const title = tn === 1 ? "Speaking Module — Introduction" : "Task 5 — Introduction"
        const introText = task?.introInstruction?.trim() || "";
        return (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="flex items-start gap-2.5 mb-6">
              <div className="mt-0.5 bg-[#1a6faf] text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                <span className="font-serif italic font-bold text-[10px]">i</span>
              </div>
              <h3 className="text-[14px] font-bold text-[#1a6faf]">{title}</h3>
            </div>
            <div className="max-w-2xl ml-7 text-[#333] space-y-4 text-[13px] leading-relaxed">
              {introText.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        );
      }
      case 2: {
        const introVideo = tn === 1 ? (task?.speakingIntroVideoUrl?.trim() || task?.instructionVideoUrl?.trim()) : task?.task5IntroVideoUrl?.trim();
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
            <div className="w-full max-w-[600px] aspect-video bg-black border border-[#ced4da] shadow-md mb-8">
              <video src={introVideo} controls className="h-full w-full" />
            </div>
            <button onClick={() => sessionMode === 'simulation' ? setPreludeStep(3) : startFromIntro()} className="bg-[#1a6faf] text-white text-[13px] font-bold px-12 py-3 hover:bg-[#1565a8] uppercase transition-all rounded-none">
              Skip
            </button>
          </div>
        );
      }
      case 3: {
        const handleEnterFullscreen = async () => {
          try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); userHadFullscreenRef.current = true; } catch {}
          startFromIntro();
        };
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-[#1a6faf]/5 w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-[#1a6faf]/10">
              <div className="bg-[#1a6faf] text-white rounded-full w-10 h-10 flex items-center justify-center"><span className="font-serif italic font-bold text-2xl mt-0.5">i</span></div>
            </div>
            <h2 className="text-[20px] font-bold text-[#111] mb-4 tracking-tight">Full-Screen Mode Required</h2>
            <p className="text-[14px] text-[#555] leading-relaxed max-w-md">To maintain test integrity and simulate the real exam environment, please enter <span className="text-[#1a6faf] font-bold">Fullscreen Mode</span> to begin your speaking task.</p>
            <div className="mt-10 flex gap-4">
              <button onClick={handleEnterFullscreen} className="bg-[#1a6faf] text-white text-[13px] font-bold px-10 py-3 hover:bg-[#1565a8] uppercase transition-all rounded-none">Enter Fullscreen</button>
              <button onClick={startFromIntro} className="text-[#666] text-[13px] font-bold px-6 py-3 hover:text-[#111] uppercase transition-all">Skip</button>
            </div>
          </div>
        );
      }
      case 4: {
        const isTask5A = tn === 5 && sub5 === "A";
        const isTask5B = tn === 5 && sub5 === "B";
        const isSingleColumn = !isTask5A && !task?.imageUrl && !isTask5B;

        let task5Choices = { myChoice: null as any, sisterChoice: null as any };
        if (isTask5B) {
          try {
            task5Choices = JSON.parse(localStorage.getItem(`test_${setNumber}_task5_choices`) || "{}");
          } catch {}
        }

        const renderTimerBox = (maxWidth: string = "max-w-[400px]") => (
          <div className={`w-full ${maxWidth} mx-auto bg-[#e2e3e5] rounded-[10px] p-5 flex items-center gap-6 shadow-sm border border-[#dee2e6]`}>
            <div className="w-[60px] h-[60px] bg-[#f0f0f0] rounded-[8px] flex items-center justify-center shrink-0 border border-[#d1d5db]">
              {phase === "preparing" ? (
                <Clock className="w-8 h-8 text-[#a0a0a0] stroke-[2]" />
              ) : (
                <Mic className={`w-8 h-8 ${phase === "recording" ? "text-[#a0a0a0]" : "text-[#a0a0a0]"} stroke-[2]`} />
              )}
            </div>
            <div className="flex flex-col items-center flex-1 pr-4">
              <span className="text-[16px] text-black mb-2 font-normal">
                {phase === "preparing" ? "Preparation Time" : phase === "recording" ? "Recording..." : phase === "submitting" ? "Uploading..." : "Done!"}
              </span>
              {phase === "preparing" ? (
                <span className="text-[20px] text-[#1a6faf] font-medium tracking-wide">
                  {timeLeft}
                </span>
              ) : (
                <div className="w-full bg-[#ebebeb] h-[18px] rounded-none flex">
                  <div 
                    className="bg-[#00cfff] h-full transition-all duration-1000 ease-linear" 
                    style={{ width: `${phase === 'recording' ? ((task?.speakingTime || 60) - timeLeft) / (task?.speakingTime || 60) * 100 : 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );

        const promptParts = task?.prompt?.split('\n').filter((p: string) => p.trim() !== '') || [];
        const bluePrompt = promptParts.length > 0 ? promptParts[0] : '';
        const grayPrompt = promptParts.length > 1 ? promptParts.slice(1).join('\n\n') : '';

        return (
          <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 pb-4">
            <div className={`flex items-start gap-3 ${grayPrompt ? 'mb-4' : 'mb-8'}`}>
              <div className="mt-0.5 bg-[#0056b3] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 shadow-sm">
                <span className="font-serif italic font-bold text-[12px]">i</span>
              </div>
              <h3 className="text-[15px] font-bold text-[#0056b3] leading-relaxed max-w-[90%]">
                {bluePrompt}
              </h3>
            </div>
            {grayPrompt && (
              <div className="text-[14px] text-[#555] leading-relaxed mb-8 ml-8 whitespace-pre-wrap font-bold max-w-[90%]">
                {grayPrompt}
              </div>
            )}

            {isSingleColumn ? (
              <div className="flex justify-center mb-10 flex-col items-center">
                {inlineMessage && (
                  <div className="mb-4 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    {inlineMessage}
                  </div>
                )}
                {renderTimerBox()}
              </div>
            ) : isTask5B ? (
              <div className="flex flex-col gap-8 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Left side: Sister's Choice */}
                  <div className="flex flex-col gap-2 p-4 bg-white border border-[#ced4da]">
                    <span className="text-[14px] font-bold text-center text-[#333] uppercase tracking-wide">Your Sister's Choice</span>
                    {task5Choices.sisterChoice?.imageUrl && <img src={task5Choices.sisterChoice.imageUrl} alt="Sister's Choice" className="w-full h-auto object-contain rounded-none border border-[#dee2e6] shadow-sm mb-4" />}
                    <div className="text-[13px] text-[#333] leading-relaxed">
                      {(task5Choices.sisterChoice?.label || "").split('\n').map((line: string, idx: number) => {
                        if (idx === 0) return <div key={idx} className="font-bold text-[14px] text-black mb-3">{line}</div>;
                        return <div key={idx} className="flex gap-2"><span className="text-[#666]">-</span><span>{line.replace(/^- /, '')}</span></div>;
                      })}
                    </div>
                  </div>
                  {/* Right side: Your Choice (Light Green) */}
                  <div className="flex flex-col gap-2 p-4 bg-[#eef8ed] border border-[#ced4da]">
                    <span className="text-[14px] font-bold text-center text-[#333] uppercase tracking-wide">Your Choice</span>
                    {task5Choices.myChoice?.imageUrl && <img src={task5Choices.myChoice.imageUrl} alt="Your Choice" className="w-full h-auto object-contain rounded-none border border-[#dee2e6] shadow-sm mb-4" />}
                    <div className="text-[13px] text-[#333] leading-relaxed">
                      {(task5Choices.myChoice?.label || "").split('\n').map((line: string, idx: number) => {
                        if (idx === 0) return <div key={idx} className="font-bold text-[14px] text-black mb-3">{line}</div>;
                        return <div key={idx} className="flex gap-2"><span className="text-[#666]">-</span><span>{line.replace(/^- /, '')}</span></div>;
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  {renderTimerBox()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 mb-10">
                {/* Left side: Image or Options */}
                <div className="flex-1 flex flex-col gap-4">
                  {isTask5A ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(["A", "B"] as const).map((key) => {
                        const src = key === "A" ? task?.imageUrlA : task?.imageUrlB;
                        const caption = key === "A" ? task?.optionALabel : task?.optionBLabel;
                        if (!src?.trim()) return null;
                        return (
                          <button key={key} onClick={() => setSelected5AOption(key)} className={`flex flex-col gap-2 p-4 bg-white border-2 transition-all text-left ${selected5AOption === key ? 'border-[#1a6faf] ring-2 ring-[#1a6faf]/10' : 'border-[#ced4da] hover:border-[#aaa]'}`}>
                            <img src={src} alt={caption} className="w-full h-auto object-contain rounded-none border border-[#dee2e6] shadow-sm mb-4" />
                            <div className="text-[13px] text-[#333] leading-relaxed">
                              {(caption || "").split('\n').map((line, idx) => {
                                if (idx === 0) return <div key={idx} className="font-bold text-[14px] text-black mb-3">{line}</div>;
                                return <div key={idx} className="flex gap-2"><span className="text-[#666]">-</span><span>{line.replace(/^- /, '')}</span></div>;
                              })}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : task?.imageUrl ? (
                    <img src={task.imageUrl} alt="Scenario" className="max-w-full rounded-none border border-[#ced4da] shadow-sm" />
                  ) : null}
                </div>

                {/* Right side: Recording Box */}
                {isTask5A ? null : (
                  <div className="w-full md:w-[280px] shrink-0">
                    <div className="flex flex-col items-center">
                      {inlineMessage && (
                        <div className="mb-4 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-center w-full">
                          {inlineMessage}
                          {phase === "done" && <div className="mt-1 text-xs font-normal text-red-500">Click NEXT to continue.</div>}
                        </div>
                      )}
                      {renderTimerBox("max-w-full")}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* For Task 5A, the timer box is at the bottom, centered */}
            {isTask5A && (
              <div className="flex justify-center mt-6 mb-10 w-full">
                {renderTimerBox()}
              </div>
            )}

            <div className="text-[12px] text-[#555] mb-6 font-bold mt-auto">
              *NOTE: This practice test is not recording your response.
            </div>
            
            <button className="w-full border border-[#333] bg-white py-3.5 text-[15px] font-medium text-[#111] hover:bg-gray-50 transition-colors rounded-none shrink-0">
              Click here to view sample responses.
            </button>
          </div>
        );
      }
      default: return null;
    }
  };

  if (phase === "loading") {
    return <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#1a6faf] animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans overflow-y-auto">
      <CelpipTopBar />
      <div className="flex-1 flex items-start justify-center p-4 py-4">
        <div className="w-full max-w-[850px] min-h-[650px] bg-white border border-[#ced4da] shadow-sm flex flex-col relative overflow-hidden">
          <header className="h-[44px] bg-[#e8eaed] border-b border-[#ced4da] px-4 flex items-center justify-between shrink-0">
            <span className="text-[13px] font-normal text-[#333]">{headerTitle()}</span>
            <div className="flex items-center gap-6">
              {preludeStep === 4 && (
                <div className="text-[12px] text-[#555]">
                  Preparation: <span className="font-bold text-[#111]">{task?.prepTime ?? 30} seconds</span> Recording: <span className="font-bold text-[#111]">{task?.speakingTime || 60} seconds</span>
                </div>
              )}
              <button onClick={handleNext} disabled={phase === "submitting" || (preludeStep === 4 && timeLeft <= 0)} className="bg-[#1a6faf] text-white text-[11px] font-bold px-4 py-1.5 hover:bg-[#1565a8] uppercase disabled:opacity-50 transition-colors rounded-none">NEXT</button>
            </div>
          </header>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{renderContent()}</div>
          <footer className="h-[44px] bg-[#e8eaed] border-t border-[#ced4da] flex items-center justify-end px-4 shrink-0">
            <button onClick={handleBackStep} className="bg-[#1a6faf] text-white text-[11px] font-bold px-4 py-1.5 hover:bg-[#1565a8] uppercase transition-colors rounded-none">Back</button>
          </footer>
        </div>
      </div>
      {sessionMode === 'simulation' && tabReturnModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="w-[500px] max-w-[95vw] bg-white border border-[#ced4da] shadow-2xl overflow-hidden flex flex-col">
            <div className="h-11 bg-[#e8eaed] border-b border-[#ced4da] px-6 flex items-center shrink-0"><span className="text-[16px] font-bold text-[#1a6faf]">Integrity Alert</span></div>
            <div className="p-8 text-[14px] text-[#444] leading-relaxed font-medium">{SIM_TAB_SWITCH_MESSAGES[tabReturnModal.strike - 1]?.body}</div>
            <div className="h-14 bg-[#f8f9fa] border-t border-[#ced4da] px-6 flex items-center justify-end shrink-0">
              <button onClick={() => setTabReturnModal((m) => ({ ...m, open: false }))} className="bg-[#1a6faf] text-white text-[12px] font-bold px-10 h-full flex items-center justify-center uppercase border-none rounded-none" style={{ marginRight: '-24px' }}>Resume Test</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeakingPlayer
