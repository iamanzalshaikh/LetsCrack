import api from './api';

export interface MCQQuestion {
  _id: string;
  questionText: string;
  options: string[];
}

export interface MCQTask {
  _id: string;
  module: 'reading' | 'listening';
  testSetNumber: number;
  passageText?: string;
  audioUrl?: string;
  allowReplay?: boolean;
  allowSeek?: boolean;
  playLimit?: number;
  mcqs: MCQQuestion[];
}

export interface MCQAnswer {
  questionId: string;
  selectedOption: number;
}

export interface MCQSubmitPayload {
  studentId: string;
  testSetNumber: number;
  module: 'reading' | 'listening';
  answers: MCQAnswer[];
}

export interface MCQSubmitResult {
  success: boolean;
  score: number;
  total: number;
  percentage: string;
  band: string;
  sessionId: string;
}

export const getMCQTask = async (
  module: 'reading' | 'listening',
  setNumber: number
): Promise<MCQTask> => {
  const response = await api.get(`/mcq/task/${module}/${setNumber}`);
  return response.data;
};

export const submitMCQAnswers = async (
  payload: MCQSubmitPayload
): Promise<MCQSubmitResult> => {
  const response = await api.post('/mcq/submit', payload);
  return response.data;
};
