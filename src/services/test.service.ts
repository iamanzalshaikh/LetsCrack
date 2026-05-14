import api from './api';

export interface TestSet {
  testSetNumber: number;
  title: string;
  description: string;
  moduleCount: number;
  supportedModes: ('practice' | 'simulation')[];
  modules: ('writing' | 'speaking' | 'reading' | 'listening')[];
  estimatedTime: string;
}

export type TestMode = 'practice' | 'simulation';
export type TestModule = 'writing' | 'speaking' | 'reading' | 'listening';

export interface TestResultPayload {
  _id?: string;
  writingBand?: number | string;
  speakingBand?: number | string;
  readingBand?: number | string;
  listeningBand?: number | string;
  overallBand?: number | string;
  submittedAt?: string;
  publishedAt?: string;
}

export interface ResultStatus {
  sessionId: string;
  mode: TestMode;
  selectedModules: TestModule[];
  instructionsAccepted: boolean;
  status: 'in_progress' | 'submitted' | 'grading' | 'graded';
  progress: {
    writing: { submitted: number; graded: number; total: number };
    speaking: { submitted: number; graded: number; total: number };
    reading: { submitted: number; graded: number; total: number };
    listening: { submitted: number; graded: number; total: number };
    overall: { submitted: number; graded: number; total: number };
  };
  submittedAt?: string;
  startedAt?: string;
}

export interface ProgressAttempt {
  setNumber: number;
  writingBand?: number | string;
  speakingBand?: number | string;
  readingBand?: number | string;
  listeningBand?: number | string;
  overallBand?: number | string;
  date: string;
}


export interface StartTestPayload {
  mode: TestMode;
  selectedModules: TestModule[];
  forceNewSession?: boolean;
}

export interface StartTestResponse {
  success: boolean;
  sessionId: string;
  mode: TestMode;
  selectedModules: TestModule[];
  message: string;
  hasOngoingSession?: boolean;
}

export interface TestInstructions {
  testSetNumber: number;
  mode: TestMode;
  instructions: string;
  modules: TestModule[];
  estimatedTimeMinutes: number;
}

export interface MediaEventResponse {
  success: boolean;
  allowed: boolean;
  reason: string;
  policy: {
    allowReplay: boolean;
    allowSeek: boolean;
    playLimit: number;
  };
  runtimeState: {
    playCount: number;
    seekCount: number;
    blockedCount: number;
  };
}

const TEST_CACHE_TTL_MS = 30_000;
const PROGRESS_CACHE_TTL_MS = 20_000;

let testsCache: { data: TestSet[]; at: number } | null = null;
let testsInFlight: Promise<TestSet[]> | null = null;
let progressCache: { data: ProgressAttempt[]; at: number } | null = null;
let progressInFlight: Promise<ProgressAttempt[]> | null = null;

// ── Test Library ──────────────────────────────────────────────────────────────
export const getAvailableTests = async (): Promise<TestSet[]> => {
  const now = Date.now();
  if (testsCache && now - testsCache.at < TEST_CACHE_TTL_MS) {
    return testsCache.data;
  }
  if (testsInFlight) return testsInFlight;

  testsInFlight = (async () => {
    try {
      const response = await api.get('/student/tests');
      const list = response.data.testSets as TestSet[];
      testsCache = { data: list, at: Date.now() };
      return list;
    } catch (error: unknown) {
      const status =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response?.status === 'number'
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 429 && testsCache) return testsCache.data;
      throw error;
    } finally {
      testsInFlight = null;
    }
  })();

  return testsInFlight;
};

// ── Session Start (now sends mode + selectedModules) ─────────────────────────
export const startTestSession = async (
  testSetNumber: number,
  payload: StartTestPayload
): Promise<StartTestResponse> => {
  const response = await api.post(`/student/start-test/${testSetNumber}`, payload);
  return response.data;
};

// ── Instructions ──────────────────────────────────────────────────────────────
export const getTestInstructions = async (
  testSetNumber: number,
  mode: TestMode
): Promise<TestInstructions> => {
  const response = await api.get(`/student/test-instructions/${testSetNumber}`, {
    params: { mode },
  });
  return response.data;
};

export const confirmInstructions = async (sessionId: string) => {
  const response = await api.post(`/student/session/${sessionId}/confirm-instructions`);
  return response.data;
};

// ── Media Enforcement ─────────────────────────────────────────────────────────
export const recordMediaEvent = async (
  sessionId: string,
  module: TestModule,
  taskNumber: number,
  eventType: 'play_start' | 'replay_attempt' | 'seek_attempt',
  subTask?: 'A' | 'B'
): Promise<MediaEventResponse> => {
  const response = await api.post('/student/media/runtime-event', {
    sessionId,
    module,
    taskNumber,
    eventType,
    ...(subTask && taskNumber === 5 ? { subTask } : {}),
  });
  return response.data;
};

// ── Progress & Results ────────────────────────────────────────────────────────
export const getProgress = async (): Promise<ProgressAttempt[]> => {
  const now = Date.now();
  if (progressCache && now - progressCache.at < PROGRESS_CACHE_TTL_MS) {
    return progressCache.data;
  }
  if (progressInFlight) return progressInFlight;

  progressInFlight = (async () => {
    try {
      const response = await api.get('/student/progress');
      const attempts = response.data.attempts as ProgressAttempt[];
      progressCache = { data: attempts, at: Date.now() };
      return attempts;
    } catch (error: unknown) {
      const status =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response?.status === 'number'
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 429 && progressCache) return progressCache.data;
      throw error;
    } finally {
      progressInFlight = null;
    }
  })();

  return progressInFlight;
};

/** Pass sessionId after a test redirect so `/results/:setNumber?sessionId=…` resolves the correct attempt’s writing. */
export const getTestResults = async (testSetNumber: number, sessionId?: string | null) => {
  const params = sessionId ? { sessionId } : {};
  const response = await api.get(`/student/results/${testSetNumber}`, { params });
  return response.data;
};

export const getResultStatus = async (sessionId: string) => {
  const response = await api.get(`/student/result-status/${sessionId}`);
  return response.data;
};

// ── Certificate PDF Download ──────────────────────────────────────────────────
export const downloadCertificate = async (resultId: string, studentName: string) => {
  const response = await api.get(`/student/certificate/${resultId}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `LetsCrack_Certificate_${studentName.replace(/\s/g, '_')}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadAiEvaluationPdf = async (
  testSetNumber: number,
  studentName: string,
  sessionId?: string | null
) => {
  const response = await api.get(`/student/ai-report/${testSetNumber}`, {
    params: sessionId ? { sessionId } : {},
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `LetsCrack_AI_Evaluation_${studentName.replace(/\s/g, '_')}_Set${testSetNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
