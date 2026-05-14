import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Save,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  bulkImportQuestions,
  getTestSetQuestions,
  publishTestSet,
  uploadMedia,
  createOrUpdateTestSet,
} from "@/services/admin.service";
import {
  type BuilderFormValues,
  SPEAKING_SLOTS,
  getDefaultBuilderForm,
  findSpeakingDoc,
  mapSpeakingDoc,
  mapWritingDoc,
} from "./defaults";

const STORAGE_PREFIX = "lc-test-builder-v1";

function buildWritingPayload(
  v: BuilderFormValues,
  taskNumber: 1 | 2,
  block: BuilderFormValues["writing1"],
) {
  const taskInstructions = block.taskInstructionsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const base = {
    module: "writing" as const,
    testSetNumber: v.testSetNumber,
    taskNumber,
    timeLimit: block.timeLimit,
    imageUrl: block.imageUrl || undefined,
    sampleResponse: block.sampleResponse || undefined,
    scenario: {
      subheading: block.subheading || undefined,
      backgroundParagraph: block.backgroundParagraph || undefined,
      taskInstructions,
    },
    wordCountTarget: block.wordCountTarget || undefined,
  };
  if (taskNumber === 1) {
    return { ...base, questions: [] as const };
  }
  return {
    ...base,
    surveyTopic: block.surveyTopic || undefined,
    optionA: block.optionA || undefined,
    optionB: block.optionB || undefined,
    questions: block.questions.slice(0, 1).map((q, i) => ({
      questionNumber: q.questionNumber || i + 1,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.optionsText
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
      wordCountTarget: q.wordCountTarget || undefined,
    })),
  };
}

function buildSpeakingPayload(
  v: BuilderFormValues,
  index: number,
  row: BuilderFormValues["speaking"][number],
) {
  const slot = SPEAKING_SLOTS[index];
  if (!slot) return null;
  const base = {
    module: "speaking" as const,
    testSetNumber: v.testSetNumber,
    taskNumber: slot.taskNumber,
    subTask: slot.subTask,
    prompt: row.prompt,
    prepTime: row.prepTime,
    speakingTime: row.speakingTime,
    sampleTranscript: row.sampleTranscript || undefined,
    mediaType: row.mediaType,
    mediaUrl: row.mediaUrl || undefined,
    instructionVideoUrl: row.instructionVideoUrl || undefined,
    allowReplay: row.allowReplay,
    allowSeek: row.allowSeek,
    playLimit: row.playLimit,
  };
  if (slot.taskNumber === 5 && slot.subTask === "A") {
    return {
      ...base,
      imageUrl: null,
      imageUrlA: row.imageUrlA?.trim() ? row.imageUrlA : null,
      imageUrlB: row.imageUrlB?.trim() ? row.imageUrlB : null,
      imageUrlC: row.imageUrlC?.trim() ? row.imageUrlC : null,
      optionALabel: row.optionALabel?.trim() ? row.optionALabel : null,
      optionBLabel: row.optionBLabel?.trim() ? row.optionBLabel : null,
      optionCLabel: row.optionCLabel?.trim() ? row.optionCLabel : null,
    };
  }
  if (slot.taskNumber === 5 && slot.subTask === "B") {
    return {
      ...base,
      imageUrl: null,
      imageUrlA: null,
      imageUrlB: null,
      imageUrlC: null,
      optionALabel: null,
      optionBLabel: null,
      optionCLabel: null,
    };
  }
  return {
    ...base,
    imageUrl: row.imageUrl || undefined,
    imageUrlA: null,
    imageUrlB: null,
    imageUrlC: null,
    optionALabel: null,
    optionBLabel: null,
    optionCLabel: null,
  };
}

function runValidation(v: BuilderFormValues, enabledModules: string[]): string[] {
  const issues: string[] = [];
  const hasWriting = enabledModules.includes("writing");
  const hasSpeaking = enabledModules.includes("speaking");

  if (!v.testSetNumber || v.testSetNumber < 1) {
    issues.push("Set number is invalid; use the test set list to pick a set.");
  }
  
  if (hasWriting) {
    if (!v.writing1.backgroundParagraph?.trim()) {
      issues.push("Writing 1: background paragraph is empty");
    }
    if (!v.writing2.surveyTopic?.trim()) {
      issues.push("Writing 2: survey topic is empty");
    }
  }

  if (hasSpeaking) {
    v.speaking.forEach((row, i) => {
      const slot = SPEAKING_SLOTS[i];
      const label = slot?.label ?? `Slot ${i}`;
      if (!row.prompt?.trim()) issues.push(`Speaking ${label}: prompt is empty`);
      if (slot?.id === "sp-5a") {
        if (!row.imageUrlA?.trim())
          issues.push("Speaking Task 5A: Option A image is required");
        if (!row.imageUrlB?.trim())
          issues.push("Speaking Task 5A: Option B image is required");
        if (!row.optionALabel?.trim())
          issues.push("Speaking Task 5A: Option A label is required");
        if (!row.optionBLabel?.trim())
          issues.push("Speaking Task 5A: Option B label is required");
        if (row.prepTime !== 60)
          issues.push("Speaking Task 5A: prep time should be 60 seconds");
        if (row.speakingTime !== 0)
          issues.push("Speaking Task 5A: speaking time should be 0 seconds");
      }
      if (slot?.id === "sp-5b") {
        if (row.prepTime !== 60)
          issues.push("Speaking Task 5B: prep time should be 60 seconds");
        if (row.speakingTime !== 60)
          issues.push("Speaking Task 5B: speaking time should be 60 seconds");
      }
    });
  }
  return issues;
}

type MediaFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  accept?: string;
  uploadOnly?: boolean;
};

const MediaField: React.FC<MediaFieldProps> = ({
  label,
  value,
  onChange,
  disabled,
  accept = "image/*,audio/*,video/*",
  uploadOnly = false,
}) => {
  const [busy, setBusy] = useState(false);
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const { mediaUrl } = await uploadMedia(f);
      onChange(mediaUrl);
    } catch {
      window.alert(
        "Upload failed. Check that you are logged in as admin and the file is under 10MB.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {!uploadOnly ? (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="https://"
            className="flex-1"
          />
        ) : (
          <div className="flex h-9 flex-1 items-center rounded-lg border border-border/80 bg-muted/20 px-3 text-xs text-slate-600">
            {value ? "Video uploaded" : "No video uploaded yet"}
          </div>
        )}
        <label
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 text-xs font-semibold",
            (disabled || busy) && "pointer-events-none opacity-50",
          )}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Upload
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={onFile}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};

const NavLink: React.FC<{ targetId: string; children: React.ReactNode }> = ({
  targetId,
  children,
}) => (
  <button
    type="button"
    onClick={() =>
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    className="w-full text-left text-xs font-semibold text-slate-600 transition hover:text-blue-600"
  >
    {children}
  </button>
);

const TestSetBuilderContent: React.FC<{ testSetKey: number }> = ({
  testSetKey,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<BuilderFormValues>({
    defaultValues: getDefaultBuilderForm(testSetKey),
  });

  const watched = useWatch({ control });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [lastLocalSave, setLastLocalSave] = useState<Date | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[] | null>(
    null,
  );
  const [enabledModules, setEnabledModules] = useState<string[]>(["writing", "speaking"]);
  const firstHydrate = useRef(true);

  useEffect(() => {
    firstHydrate.current = true;
  }, [testSetKey]);

  const storageKey = `${STORAGE_PREFIX}-${watched?.testSetNumber ?? "draft"}`;

  useEffect(() => {
    if (!watched) return;
    if (firstHydrate.current) {
      firstHydrate.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(watched));
        setLastLocalSave(new Date());
      } catch {
        // ignore
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [watched, storageKey]);

  const loadFromServer = useCallback(async () => {
    const n = testSetKey;
    setStatus("saving");
    try {
      const data = await getTestSetQuestions(n);
      const def = getDefaultBuilderForm(n);
      const w1 = (data.writing as Record<string, unknown>[]).find(
        (x) => x.taskNumber === 1,
      );
      const w2 = (data.writing as Record<string, unknown>[]).find(
        (x) => x.taskNumber === 2,
      );
      const sp = data.speaking as Record<string, unknown>[];
      
      if (data.testSet?.modules) {
        setEnabledModules(data.testSet.modules);
      }

      const w1_form = mapWritingDoc(1, w1, def.writing1);
      if (data.testSet?.instructions) {
        w1_form.introInstructionText = data.testSet.instructions.writingInstructionText;
        w1_form.introVideoUrl = data.testSet.instructions.writingInstructionVideoUrl;
      }

      const sp_rows = SPEAKING_SLOTS.map((slot) =>
        mapSpeakingDoc(
          findSpeakingDoc(sp, slot.taskNumber, slot.subTask),
          slot.subTask,
        ),
      );
      if (sp_rows[0] && data.testSet?.instructions) {
        sp_rows[0].introInstruction = data.testSet.instructions.speakingInstructionText;
        sp_rows[0].speakingIntroVideoUrl = data.testSet.instructions.speakingInstructionVideoUrl;
      }

      reset({
        testSetNumber: n,
        writing1: w1_form,
        writing2: mapWritingDoc(2, w2, def.writing2),
        speaking: sp_rows,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      console.error(e);
      setStatus("error");
      window.alert(
        "Could not load this test set. Check the number, network, and admin access.",
      );
    }
  }, [reset, testSetKey]);

  useEffect(() => {
    setValue("testSetNumber", testSetKey);
  }, [setValue, testSetKey]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadFromServer();
    }, 0);
    return () => window.clearTimeout(t);
  }, [loadFromServer, testSetKey]);

  const saveAllQuestions = async (v: BuilderFormValues) => {
    const payloads: Record<string, unknown>[] = [];
    
    if (enabledModules.includes("writing")) {
      payloads.push(buildWritingPayload(v, 1, v.writing1));
      payloads.push(buildWritingPayload(v, 2, v.writing2));
    }
    
    if (enabledModules.includes("speaking")) {
      const sp = v.speaking
        .map((row, i) => buildSpeakingPayload(v, i, row))
        .filter((p): p is NonNullable<typeof p> => p != null);
      payloads.push(...sp);
    }

    if (payloads.length > 0) {
      await bulkImportQuestions(payloads, false);
    }

    // Also update TestSet metadata for instructions
    const existingData = await getTestSetQuestions(v.testSetNumber);
    if (existingData.testSet) {
      await createOrUpdateTestSet({
        testSetNumber: v.testSetNumber,
        title: existingData.testSet.title || "Untitled",
        instructions: {
          practice: existingData.testSet.instructions?.practice || "",
          simulation: existingData.testSet.instructions?.simulation || "",
          writingInstructionText: v.writing1.introInstructionText,
          writingInstructionVideoUrl: v.writing1.introVideoUrl,
          speakingInstructionText: v.speaking[0]?.introInstruction,
          speakingInstructionVideoUrl: v.speaking[0]?.speakingIntroVideoUrl,
        },
      });
    }
  };

  const onSaveContent = async (v: BuilderFormValues) => {
    setStatus("saving");
    setValidationIssues(null);
    try {
      await saveAllQuestions(v);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      console.error(e);
      setStatus("error");
      throw e;
    }
  };

  const saveDraft = handleSubmit(async (v) => {
    try {
      await onSaveContent(v);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string, errors?: Array<{error: string}> } } };
      const serverMsg = e.response?.data?.error;
      const subErrors = e.response?.data?.errors?.map(ev => ev.error).join(", ");
      window.alert(`Save failed: ${serverMsg || "Unknown error"}${subErrors ? ` (${subErrors})` : ""}`);
    }
  });

  const publish = handleSubmit(async (v) => {
    const issues = runValidation(v, enabledModules);
    if (issues.length) {
      setValidationIssues(issues);
      document
        .getElementById("section-review")
        ?.scrollIntoView({ behavior: "smooth" });
      window.alert(
        "Fix validation issues before publishing, or use Save to persist work in progress.",
      );
      return;
    }
    if (
      !window.confirm(
        "Publish this test set? Students with access will be able to use it (per your app rules).",
      )
    ) {
      return;
    }
    try {
      setStatus("saving");
      await saveAllQuestions(v);
      await publishTestSet(v.testSetNumber);
      window.alert("Test set published.");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      window.alert("Publish failed.");
    }
  });

  const onValidate = () => {
    const v = getValues();
    setValidationIssues(runValidation(v, enabledModules));
    document
      .getElementById("section-review")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const restoreFromBrowser = () => {
    if (
      !window.confirm(
        "Replace the current form with the last browser draft for this set number?",
      )
    )
      return;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${testSetKey}`);
    if (!raw) {
      window.alert("No local draft found.");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<BuilderFormValues>;
      const def = getDefaultBuilderForm(testSetKey);
      reset({
        testSetNumber: testSetKey,
        writing1: { ...def.writing1, ...parsed.writing1 },
        writing2: {
          ...def.writing2,
          ...parsed.writing2,
          questions: parsed.writing2?.questions ?? def.writing2.questions,
        },
        speaking:
          parsed.speaking?.length === def.speaking.length
            ? (parsed.speaking as BuilderFormValues["speaking"])
            : def.speaking,
      });
    } catch {
      window.alert("Could not read local draft.");
    }
  };

  const sectionClass = "scroll-mt-24";

  return (
    <div className="flex w-full min-w-0 flex-col text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-[1600px] flex-wrap items-center gap-2 px-0 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <Badge variant="outline" className="text-[0.65rem] font-semibold">
              Set #{testSetKey}
            </Badge>
            <Badge variant="outline" className="text-[0.65rem] font-semibold">
              {enabledModules.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(" + ")}
            </Badge>
            <Link
              to={`/admin/sets/${testSetKey}/edit`}
              className="text-[0.7rem] font-semibold text-primary underline sm:text-xs"
            >
              Edit metadata
            </Link>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {lastLocalSave && (
              <span className="text-[0.7rem] text-slate-500">
                Autosave {lastLocalSave.toLocaleTimeString()}
              </span>
            )}
            {isDirty && (
              <span className="text-[0.7rem] text-amber-600">
                Unsaved changes
              </span>
            )}
            {status === "saving" && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            {status === "saved" && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Server saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onValidate}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Validate</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={restoreFromBrowser}
            >
              Restore
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void loadFromServer()}
            >
              Load
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveDraft}
              disabled={status === "saving"}
            >
              {status === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={publish}
              disabled={status === "saving"}
            >
              <Send className="h-3.5 w-3.5" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-12 hidden max-h-[calc(100dvh-7rem)] w-56 shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-slate-50/40 py-6 pl-2 pr-2 lg:flex">
          <p className="px-1 pb-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
            On this page
          </p>
          <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1 text-sm">
            {enabledModules.includes("writing") && (
              <>
                <NavLink targetId="section-w1">Writing · Task 1</NavLink>
                <NavLink targetId="section-w2">Writing · Task 2</NavLink>
              </>
            )}
            {enabledModules.includes("speaking") && SPEAKING_SLOTS.map((s) => (
              <NavLink key={s.id} targetId={`section-${s.id}`}>
                Speaking · {s.label}
              </NavLink>
            ))}
            <NavLink targetId="section-review">Review</NavLink>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-10">
          <p className="text-sm text-slate-500">
            Set <strong>#{testSetKey}</strong> — editor for CELPIP-style writing
            and speaking. Title and modules are edited in{" "}
            <Link
              className="font-semibold text-primary underline"
              to={`/admin/sets/${testSetKey}/edit`}
            >
              test set settings
            </Link>
            . Task 5 uses two rows (5A and 5B). Use <strong>Load</strong> to
            re-fetch the latest from the server. Media can be typed or uploaded.
          </p>

          {/* Writing Sections */}
          {enabledModules.includes("writing") && (
            <>
              {/* Writing 1 */}
              <section id="section-w1" className={sectionClass}>
                <Card className="border-slate-200/80 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Writing · Task 1 (email)</CardTitle>
                    <CardDescription>
                      Typical CELPIP email task. Time default 1620s (27 min).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="mb-6 space-y-4 rounded-lg border border-blue-100 bg-blue-50/30 p-4">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Module Intro (Global)</p>
                      <div className="space-y-1.5">
                        <Label>Writing Module Intro Text</Label>
                        <Textarea
                          rows={2}
                          placeholder="Instruction page text shown before Writing starts..."
                          {...register("writing1.introInstructionText" as const)}
                        />
                      </div>
                      <Controller
                        name="writing1.introVideoUrl"
                        control={control}
                        render={({ field }) => (
                          <MediaField label="Writing Intro Video" uploadOnly accept="video/*" {...field} />
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Time limit (seconds)</Label>
                        <Input
                          type="number"
                          min={1}
                          {...register("writing1.timeLimit", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Word count target</Label>
                        <Input
                          {...register("writing1.wordCountTarget")}
                          placeholder="150-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subheading</Label>
                      <Input {...register("writing1.subheading")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Background paragraph</Label>
                      <Textarea
                        rows={4}
                        {...register("writing1.backgroundParagraph")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Task instructions (one per line)</Label>
                      <Textarea
                        rows={3}
                        {...register("writing1.taskInstructionsText")}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Controller
                        name="writing1.imageUrl"
                        control={control}
                        render={({ field }) => (
                          <MediaField label="Image (optional)" {...field} />
                        )}
                      />
                      <div className="space-y-1.5">
                        <Label>Sample response (optional)</Label>
                        <Textarea
                          rows={2}
                          {...register("writing1.sampleResponse")}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Writing 2 */}
              <section id="section-w2" className={sectionClass}>
                <Card className="border-slate-200/80 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Writing · Task 2 (survey)</CardTitle>
                    <CardDescription>
                      Time default 1560s (26 min). Add one card per survey question.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Time limit (seconds)</Label>
                        <Input
                          type="number"
                          min={1}
                          {...register("writing2.timeLimit", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Word count (global hint)</Label>
                        <Input {...register("writing2.wordCountTarget")} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Survey topic</Label>
                      <Input {...register("writing2.surveyTopic")} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Option A (compatibility / survey)</Label>
                        <Input {...register("writing2.optionA")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Option B</Label>
                        <Input {...register("writing2.optionB")} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="normal-case! tracking-normal! text-sm font-bold text-foreground">
                        Response question (single question only)
                      </Label>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                        <div className="mb-3">
                          <span className="text-xs font-bold text-slate-500">
                            Question 1
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label>Question text</Label>
                            <Textarea
                              rows={2}
                              {...register(`writing2.questions.0.questionText` as const)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Type</Label>
                            <select
                              className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-2 text-sm"
                              {...register(`writing2.questions.0.questionType` as const)}
                            >
                              <option value="open_ended">Open ended</option>
                              <option value="multiple_choice">Multiple choice</option>
                              <option value="rating_scale">Rating scale</option>
                              <option value="checkbox">Checkbox</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Word count</Label>
                            <Input
                              {...register(`writing2.questions.0.wordCountTarget` as const)}
                              placeholder="e.g. 150-200"
                            />
                          </div>
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label>Options (optional)</Label>
                            <Textarea
                              rows={2}
                              {...register(`writing2.questions.0.optionsText` as const)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Controller
                      name="writing2.imageUrl"
                      control={control}
                      render={({ field }) => (
                        <MediaField label="Image (optional)" {...field} />
                      )}
                    />
                    <div className="space-y-1.5">
                      <Label>Sample response (optional)</Label>
                      <Textarea rows={3} {...register("writing2.sampleResponse")} />
                    </div>
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* Speaking Sections */}
          {enabledModules.includes("speaking") && (
            <Accordion
              type="multiple"
              className="space-y-3"
              defaultValue={SPEAKING_SLOTS.slice(0, 3).map((s) => s.id)}
            >
              {SPEAKING_SLOTS.map((slot, i) => (
                <div
                  key={slot.id}
                  id={`section-${slot.id}`}
                  className="scroll-mt-24"
                >
                  <AccordionItem
                    value={slot.id}
                    className="rounded-xl border border-slate-200/80 bg-white px-1"
                  >
                    <AccordionTrigger className="px-3 text-left">
                      Speaking · {slot.label}
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4">
                      <div className="space-y-4 pt-2">
                        {slot.id === "sp-1" && (
                          <div className="mb-6 space-y-4 rounded-lg border border-blue-100 bg-blue-50/30 p-4">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Module Intro (Global)</p>
                            <div className="space-y-1.5">
                              <Label>Speaking Module Intro Text</Label>
                              <Textarea
                                rows={2}
                                placeholder="Text shown at the very start of the speaking module..."
                                {...register(`speaking.${i}.introInstruction` as const)}
                              />
                            </div>
                            <Controller
                              name={`speaking.${i}.speakingIntroVideoUrl` as const}
                              control={control}
                              render={({ field }) => (
                                <MediaField label="Module Intro Video" uploadOnly accept="video/*" {...field} />
                              )}
                            />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label>Prompt / Question</Label>
                          <Textarea
                            rows={3}
                            {...register(`speaking.${i}.prompt` as const)}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>Preparation time (seconds)</Label>
                            <Input
                              type="number"
                              min={0}
                              {...register(`speaking.${i}.prepTime` as const, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Speaking time (seconds)</Label>
                            <Input
                              type="number"
                              min={0}
                              {...register(
                                `speaking.${i}.speakingTime` as const,
                                {
                                  valueAsNumber: true,
                                },
                              )}
                            />
                          </div>
                        </div>

                        {slot.taskNumber === 5 && slot.subTask === "A" ? (
                          <div className="space-y-4 rounded-lg border border-dashed border-slate-300 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task 5 Comparison Options & Instructions</p>
                            </div>
                            
                            <div className="grid gap-4 sm:grid-cols-2 mb-4">
                              <div className="space-y-1.5">
                                <Label>Task 5 Instructions Text</Label>
                                <Textarea
                                  rows={2}
                                  placeholder="Instructions shown before Task 5 starts..."
                                  {...register(`speaking.${i}.introInstruction` as const)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Controller
                                  name={`speaking.${i}.task5IntroVideoUrl` as const}
                                  control={control}
                                  render={({ field }) => (
                                    <MediaField label="Task 5 Intro Video" uploadOnly accept="video/*" {...field} />
                                  )}
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="space-y-3">
                                <Controller
                                  name={`speaking.${i}.imageUrlA` as const}
                                  control={control}
                                  render={({ field }) => (
                                    <MediaField label="Option A Image" {...field} />
                                  )}
                                />
                                <div className="space-y-1.5">
                                  <Label>Option A Label</Label>
                                  <Input {...register(`speaking.${i}.optionALabel` as const)} placeholder="e.g. Magazine Ad" />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Controller
                                  name={`speaking.${i}.imageUrlB` as const}
                                  control={control}
                                  render={({ field }) => (
                                    <MediaField label="Option B Image" {...field} />
                                  )}
                                />
                                <div className="space-y-1.5">
                                  <Label>Option B Label</Label>
                                  <Input {...register(`speaking.${i}.optionBLabel` as const)} placeholder="e.g. Video Ad" />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Controller
                                  name={`speaking.${i}.imageUrlC` as const}
                                  control={control}
                                  render={({ field }) => (
                                    <MediaField label="Option C Image" {...field} />
                                  )}
                                />
                                <div className="space-y-1.5">
                                  <Label>Option C Label</Label>
                                  <Input {...register(`speaking.${i}.optionCLabel` as const)} placeholder="e.g. Social Ad" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Controller
                              name={`speaking.${i}.imageUrl` as const}
                              control={control}
                              render={({ field }) => (
                                <MediaField
                                  label="Reference Image (optional)"
                                  {...field}
                                />
                              )}
                            />
                            <div className="space-y-1.5">
                              <Label>Instruction Video (optional)</Label>
                              <Controller
                                name={`speaking.${i}.instructionVideoUrl` as const}
                                control={control}
                                render={({ field }) => (
                                  <MediaField
                                    label=""
                                    uploadOnly
                                    accept="video/*"
                                    {...field}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>Media Type</Label>
                            <select
                              className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-2 text-sm"
                              {...register(`speaking.${i}.mediaType` as const)}
                            >
                              <option value="none">None</option>
                              <option value="image">Image</option>
                              <option value="audio">Audio</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Sample transcript (optional)</Label>
                            <Textarea
                              rows={2}
                              {...register(
                                `speaking.${i}.sampleTranscript` as const,
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          )}

          {/* Review */}
          <section id="section-review" className={sectionClass}>
            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Review & validation</CardTitle>
                <CardDescription>
                  Run Validate from the top bar, or use Save / Publish.
                  Publishing runs this check first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationIssues && validationIssues.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-sm text-amber-800">
                    {validationIssues.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No validation run yet, or the last run passed. Required for
                    publish: writing 1 background, writing 2 topic and each
                    survey line, and every speaking prompt. Ensure the test set
                    has a title in settings.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

const TestSetBuilderPage: React.FC = () => {
  const { setNumber: setParam } = useParams();
  const n = Number(setParam);
  if (setParam == null || setParam === "" || !Number.isFinite(n) || n < 1) {
    return <Navigate to="/admin/sets" replace />;
  }
  return <TestSetBuilderContent testSetKey={n} key={n} />;
};

export default TestSetBuilderPage;
