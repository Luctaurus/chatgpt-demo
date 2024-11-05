// messageContext.ts
import { createContext } from 'react';

export type Feedback = {
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // 消息持续时间，默认 3000ms
};

export const FeedbackContext = createContext<{
  showFeedback: (msg: Feedback) => void;
} | null>(null);
