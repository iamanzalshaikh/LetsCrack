import api from './api';

// All endpoints use the central `api` instance which auto-attaches the Bearer token.
// studentId is extracted from JWT on the backend — do NOT send it from the frontend.

export const autoSaveWriting = async (data: {
  testSetNumber: number;
  taskNumber: number;
  responseText: string;
  wordCount: number;
  selectedOption?: string;
}) => {
  const response = await api.post('/writing/autosave', data);
  return response.data;
};

export const submitWriting = async (data: {
  testSetNumber: number;
  taskNumber: number;
  responseText: string;
  wordCount: number;
  timeTaken: number;
  selectedOption?: string;
}) => {
  /** Submission must return quickly — AI runs in BullMQ; long waits are Redis/network stalls only. */
  const response = await api.post('/writing/submit', data, { timeout: 60_000 });
  return response.data;
};

export const restoreWritingDraft = async (setNumber: number, taskNumber: number) => {
  try {
    const response = await api.get(`/writing/restore/${setNumber}/${taskNumber}`);
    return response.data;
  } catch (e: unknown) {
    const ax = e as { response?: { status?: number; data?: { code?: string } } };
    const st = ax?.response?.status;
    const code = ax?.response?.data?.code;
    if (st === 409 && code === 'SIMULATION_WRITING_LOCK') throw e;
    if (st === 403 && code === 'SIMULATION_WRITING_COMPLETE') throw e;
    return null;
  }
};

export const recordSimulationFocusLoss = async (testSetNumber: number) => {
  const response = await api.post('/writing/simulation-focus-loss', { testSetNumber });
  return response.data as { recorded: boolean; simulationFocusLossCount?: number; reason?: string };
};

export type SimulationIntegrityEventKind =
  | 'visibility_hidden'
  | 'visibility_visible'
  | 'window_blur'
  | 'window_focus'
  | 'fullscreen_enter'
  | 'fullscreen_exit'
  | 'fullscreen_skipped'
  | 'paste_blocked';

export const recordSimulationIntegrityEvents = async (
  testSetNumber: number,
  events: Array<{
    kind: SimulationIntegrityEventKind;
    at?: string;
    durationMs?: number;
    focused?: boolean;
  }>,
) => {
  const response = await api.post('/writing/simulation-integrity', { testSetNumber, events });
  return response.data as {
    recorded: boolean;
    simulationFocusLossCount?: number;
    simulationIntegrityTail?: Array<{
      kind: string;
      at: string | null;
      durationMs?: number;
      focused?: boolean;
    }>;
    reason?: string;
  };
};

// Returns { task, modePolicy } — consumers must destructure accordingly
export const getWritingTask = async (setNumber: number, taskNumber: number) => {
  const response = await api.get(`/writing/task/${setNumber}/${taskNumber}`);
  return response.data; // { task, modePolicy }
};
