import api from './api';

// ── Test Sets ────────────────────────────────────────────────────────────────
export const getTestSets = async (status?: 'draft' | 'published') => {
  const response = await api.get('/admin/test-sets', { params: status ? { status } : {} });
  return response.data.testSets;
};

export const createOrUpdateTestSet = async (payload: {
  testSetNumber: number;
  title: string;
  description?: string;
  modeSupport?: string[];
  modules?: string[];
  estimatedTimeMinutes?: number;
  instructions?: {
    practice: string;
    simulation: string;
    writingInstructionText?: string;
    writingInstructionVideoUrl?: string;
    speakingInstructionText?: string;
    speakingInstructionVideoUrl?: string;
  };
  status?: 'draft' | 'published';
}) => {
  const response = await api.post('/admin/test-set', payload);
  return response.data;
};

export const publishTestSet = async (testSetNumber: number) => {
  const response = await api.post(`/admin/test-set/${testSetNumber}/publish`);
  return response.data;
};

// ── Questions ────────────────────────────────────────────────────────────────
export const createOrUpdateQuestion = async (payload: Record<string, unknown>) => {
  const response = await api.post('/admin/question', payload);
  return response.data;
};

export const bulkImportQuestions = async (
  questions: Record<string, unknown>[],
  dryRun = false
) => {
  const response = await api.post('/admin/question/bulk', { questions, dryRun });
  return response.data;
};

// ── Media ────────────────────────────────────────────────────────────────────
export const uploadMedia = async (file: File): Promise<{ mediaUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = async (role?: string) => {
  const response = await api.get('/admin/users', { params: role ? { role } : {} });
  return response.data.users;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/user/${userId}`);
  return response.data;
};

// ── Results ──────────────────────────────────────────────────────────────────
export const publishResult = async (resultId: string) => {
  const response = await api.post(`/admin/results/publish/${resultId}`);
  return response.data;
};

// ── Retention Report ──────────────────────────────────────────────────────────
export const getRetentionReport = async () => {
  const response = await api.get('/admin/retention/report');
  return response.data;
};

export const getTestSetQuestions = async (testSetNumber: number) => {
  const response = await api.get(`/admin/test-set/${testSetNumber}/questions`);
  return response.data as { 
    testSet?: Record<string, any>;
    writing: Record<string, unknown>[]; 
    speaking: Record<string, unknown>[] 
  };
};
