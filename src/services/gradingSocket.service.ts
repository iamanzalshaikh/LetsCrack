import { io, Socket } from 'socket.io-client';
import { CLIENT_ENV } from '../config/clientEnv';

type GradingPayload = {
  sessionId: string;
  module: 'writing' | 'speaking';
  taskNumber: number;
  status?: 'grading' | 'graded';
  message?: string;
  progress?: {
    writing: { graded: number; total: number };
    speaking: { graded: number; total: number };
    overall: { graded: number; total: number };
  };
};

type Listeners = {
  onQueued?: (payload: GradingPayload) => void;
  onUpdated?: (payload: GradingPayload) => void;
  onFailed?: (payload: GradingPayload) => void;
};

let socket: Socket | null = null;

const socketBaseUrl = () => {
  return CLIENT_ENV.API_URL.replace(/\/api\/?$/, '');
};

export const connectGradingSocket = (token: string, listeners: Listeners) => {
  if (!token) return null;

  if (!socket) {
    socket = io(socketBaseUrl(), {
      transports: ['polling', 'websocket'],
      upgrade: false,
      withCredentials: true,
      auth: { token },
    });
  }

  if (listeners.onQueued) socket.on('grading:queued', listeners.onQueued);
  if (listeners.onUpdated) socket.on('grading:updated', listeners.onUpdated);
  if (listeners.onFailed) socket.on('grading:failed', listeners.onFailed);

  return socket;
};

export const disconnectGradingSocket = (listeners?: Listeners) => {
  if (!socket) return;
  if (listeners?.onQueued) socket.off('grading:queued', listeners.onQueued);
  if (listeners?.onUpdated) socket.off('grading:updated', listeners.onUpdated);
  if (listeners?.onFailed) socket.off('grading:failed', listeners.onFailed);
  socket.disconnect();
  socket = null;
};
