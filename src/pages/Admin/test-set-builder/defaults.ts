export type SurveyQuestionForm = {
  questionNumber: number;
  questionText: string;
  questionType: 'rating_scale' | 'multiple_choice' | 'checkbox' | 'open_ended';
  optionsText: string;
  wordCountTarget: string;
};

export type WritingSectionForm = {
  timeLimit: number;
  subheading: string;
  backgroundParagraph: string;
  taskInstructionsText: string;
  wordCountTarget: string;
  surveyTopic: string;
  questions: SurveyQuestionForm[];
  optionA: string;
  optionB: string;
  imageUrl: string;
  sampleResponse: string;
  // Module-level instructions
  introInstructionText?: string;
  introVideoUrl?: string;
};

export type SpeakingRowForm = {
  prompt: string;
  /** Task 1 only: speaking module intro text shown before countdown starts. */
  introInstruction: string;
  /** Task 1 only: intro video shown on speaking intro screen. */
  speakingIntroVideoUrl: string;
  /** Task 5A only: intro video shown on Task 5 instruction screen. */
  task5IntroVideoUrl: string;
  prepTime: number;
  speakingTime: number;
  /** Picture tasks (e.g. T3, T4, T8). Not used for Task 5A (use imageUrlA/B). */
  imageUrl: string;
  /** Task 5A only: option images and captions. */
  imageUrlA: string;
  imageUrlB: string;
  imageUrlC: string;
  optionALabel: string;
  optionBLabel: string;
  optionCLabel: string;
  sampleTranscript: string;
  mediaType: 'none' | 'audio' | 'video' | 'image';
  mediaUrl: string;
  instructionVideoUrl: string;
  allowReplay: boolean;
  allowSeek: boolean;
  playLimit: number;
};

import {
  SAMPLE_SPEAKING_PRESETS,
  SAMPLE_SPEAKING_PROMPTS,
  SAMPLE_WRITING_TASK1,
  SAMPLE_WRITING_TASK2,
} from "./celpipStyleSampleContent"

export const SPEAKING_SLOTS = [
  { id: 'sp-1', taskNumber: 1, subTask: null as null | 'A' | 'B', label: 'Task 1' },
  { id: 'sp-2', taskNumber: 2, subTask: null, label: 'Task 2' },
  { id: 'sp-3', taskNumber: 3, subTask: null, label: 'Task 3' },
  { id: 'sp-4', taskNumber: 4, subTask: null, label: 'Task 4' },
  { id: 'sp-5a', taskNumber: 5, subTask: 'A' as const, label: 'Task 5A' },
  { id: 'sp-5b', taskNumber: 5, subTask: 'B' as const, label: 'Task 5B' },
  { id: 'sp-6', taskNumber: 6, subTask: null, label: 'Task 6' },
  { id: 'sp-7', taskNumber: 7, subTask: null, label: 'Task 7' },
  { id: 'sp-8', taskNumber: 8, subTask: null, label: 'Task 8' },
] as const;

/** Content-only form for the writing/speaking builder. Test set metadata is edited on Test set form. */
export type BuilderFormValues = {
  testSetNumber: number;
  writing1: WritingSectionForm;
  writing2: WritingSectionForm;
  speaking: SpeakingRowForm[];
};

export const emptySurvey = (n: number): SurveyQuestionForm => ({
  questionNumber: n,
  questionText: '',
  questionType: 'open_ended',
  optionsText: '',
  wordCountTarget: '',
});

export const defaultSpeakingRow = (): SpeakingRowForm => ({
  prompt: '',
  introInstruction: '',
  speakingIntroVideoUrl: '',
  task5IntroVideoUrl: '',
  prepTime: 30,
  speakingTime: 90,
  imageUrl: '',
  imageUrlA: '',
  imageUrlB: '',
  imageUrlC: '',
  optionALabel: '',
  optionBLabel: '',
  optionCLabel: '',
  sampleTranscript: '',
  mediaType: 'none',
  mediaUrl: '',
  instructionVideoUrl: '',
  allowReplay: true,
  allowSeek: true,
  playLimit: 0,
});

const defaultWriting = (time: number, task1: boolean): WritingSectionForm => ({
  timeLimit: time,
  subheading: '',
  backgroundParagraph: '',
  taskInstructionsText: '',
  wordCountTarget: task1 ? '150-200' : '',
  surveyTopic: task1 ? '' : '',
  questions: task1 ? [] : [emptySurvey(1)],
  optionA: '',
  optionB: '',
  imageUrl: '',
  sampleResponse: '',
});

export function getDefaultBuilderForm(testSetNumber = 1): BuilderFormValues {
  const w1: WritingSectionForm = {
    ...defaultWriting(1620, true),
    ...SAMPLE_WRITING_TASK1,
  }
  const w2Base = defaultWriting(1560, false)
  const w2: WritingSectionForm = {
    ...w2Base,
    ...SAMPLE_WRITING_TASK2,
    questions: SAMPLE_WRITING_TASK2.questions.length
      ? [SAMPLE_WRITING_TASK2.questions[0]]
      : w2Base.questions,
  }
  const speaking: SpeakingRowForm[] = SPEAKING_SLOTS.map((_, i) => {
    const row: SpeakingRowForm = {
      ...defaultSpeakingRow(),
      prompt: SAMPLE_SPEAKING_PROMPTS[i] ?? "",
      prepTime: SAMPLE_SPEAKING_PRESETS[i]?.prepTime ?? 30,
      speakingTime: SAMPLE_SPEAKING_PRESETS[i]?.speakingTime ?? 90,
      mediaType: SAMPLE_SPEAKING_PRESETS[i]?.mediaType ?? "none",
    }
    if (i === 4) {
      row.optionALabel = "Advertise in magazine"
      row.optionBLabel = "Produce a promotional video"
      row.optionCLabel = "Choose a second-hand vintage car"
    }
    return row
  })
  return {
    testSetNumber,
    writing1: w1,
    writing2: w2,
    speaking,
  }
}

function matchSub(a: null | 'A' | 'B' | string | undefined, b: null | 'A' | 'B') {
  if (b === null) return a == null || a === undefined || a === '';
  return a === b;
}

export function mapWritingDoc(
  taskNumber: 1 | 2,
  doc: Record<string, unknown> | undefined,
  fallback: WritingSectionForm
): WritingSectionForm {
  if (!doc) return { ...fallback };
  const sc = (doc.scenario as { subheading?: string; backgroundParagraph?: string; taskInstructions?: string[] }) || {};
  const rawQs = doc.questions as Array<Record<string, unknown>> | undefined;
  const qs: SurveyQuestionForm[] =
    rawQs?.map((q, i) => ({
      questionNumber: Number(q.questionNumber) || i + 1,
      questionText: String(q.questionText ?? ''),
      questionType: (q.questionType as SurveyQuestionForm['questionType']) || 'open_ended',
      optionsText: Array.isArray(q.options) ? (q.options as string[]).join(', ') : '',
      wordCountTarget: String(q.wordCountTarget ?? ''),
    })) || [];
  const questionsFor2 =
    taskNumber === 2 ? (qs.length > 0 ? [qs[0]] : [emptySurvey(1)]) : [];
  return {
    timeLimit: Number(doc.timeLimit) || fallback.timeLimit,
    subheading: String(sc.subheading ?? ''),
    backgroundParagraph: String(sc.backgroundParagraph ?? ''),
    taskInstructionsText: (sc.taskInstructions || []).join('\n'),
    wordCountTarget: String(doc.wordCountTarget ?? fallback.wordCountTarget),
    surveyTopic: String(doc.surveyTopic ?? fallback.surveyTopic),
    questions: taskNumber === 1 ? [] : questionsFor2,
    optionA: String(doc.optionA ?? ''),
    optionB: String(doc.optionB ?? ''),
    imageUrl: String(doc.imageUrl ?? ''),
    sampleResponse: String(doc.sampleResponse ?? ''),
    introInstructionText: String(doc.introInstructionText ?? ''),
    introVideoUrl: String(doc.introVideoUrl ?? ''),
  };
}

export function mapSpeakingDoc(
  doc: Record<string, unknown> | undefined,
  subTask: null | 'A' | 'B' = null
): SpeakingRowForm {
  if (!doc) return defaultSpeakingRow();
  const numOr = (value: unknown, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  let imageUrl = String(doc.imageUrl ?? '')
  let imageUrlA = String(doc.imageUrlA ?? '')
  let imageUrlB = String(doc.imageUrlB ?? '')
  let imageUrlC = String(doc.imageUrlC ?? '')
  let optionALabel = String(doc.optionALabel ?? '')
  let optionBLabel = String(doc.optionBLabel ?? '')
  let optionCLabel = String(doc.optionCLabel ?? '')
  if (subTask === 'A') {
    if (!imageUrlA && !imageUrlB && !imageUrlC && imageUrl) {
      imageUrlA = imageUrl
    }
    imageUrl = ''
  } else if (subTask === 'B') {
    imageUrl = ''
    imageUrlA = ''
    imageUrlB = ''
    imageUrlC = ''
    optionALabel = ''
    optionBLabel = ''
    optionCLabel = ''
  }
  return {
    prompt: String(doc.prompt ?? ''),
    introInstruction: String(doc.introInstruction ?? ''),
    speakingIntroVideoUrl: String(doc.speakingIntroVideoUrl ?? ''),
    task5IntroVideoUrl: String(doc.task5IntroVideoUrl ?? ''),
    // Use finite checks so valid 0 values (Task 5A / 5B) are preserved.
    prepTime: numOr(doc.prepTime, 30),
    speakingTime: numOr(doc.speakingTime, 90),
    imageUrl,
    imageUrlA,
    imageUrlB,
    imageUrlC,
    optionALabel,
    optionBLabel,
    optionCLabel,
    sampleTranscript: String(doc.sampleTranscript ?? ''),
    mediaType: (['none', 'audio', 'video', 'image'].includes(String(doc.mediaType))
      ? doc.mediaType
      : 'none') as SpeakingRowForm['mediaType'],
    mediaUrl: String(doc.mediaUrl ?? ''),
    instructionVideoUrl: String(doc.instructionVideoUrl ?? ''),
    allowReplay: doc.allowReplay !== false,
    allowSeek: doc.allowSeek !== false,
    playLimit: Number(doc.playLimit) >= 0 ? Number(doc.playLimit) : 0,
  };
}

export function findSpeakingDoc(
  list: Record<string, unknown>[],
  taskNumber: number,
  sub: null | 'A' | 'B'
) {
  return list.find((s) => s.taskNumber === taskNumber && matchSub(s.subTask as string | null | undefined, sub));
}
