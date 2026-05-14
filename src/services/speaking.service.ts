import api from './api';

export const getSpeakingTask = async (
  testSetNumber: number,
  taskNumber: number,
  subTask?: 'A' | 'B' | null
) => {
  const params = new URLSearchParams({ testSetNumber: String(testSetNumber) });
  if (taskNumber === 5) {
    params.set('subTask', subTask === 'B' ? 'B' : 'A');
  }
  const response = await api.get(`/speaking/task/${taskNumber}?${params.toString()}`);
  return response.data;
};

export const saveSpeakingRecording = async (formData: FormData) => {
  const response = await api.post('/speaking/save-recording', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
