// messageContext.ts
import { createContext } from 'react'

export interface Feedback {
  content: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number // 消息持续时间，默认 3000ms
  onClose?: () => void
}

export const FeedbackContext = createContext<{
  showFeedback: (msg: Feedback) => void
} | null>(null)
