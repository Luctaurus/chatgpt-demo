import { FeedbackContext } from '@/components/MessageFeedback/feedback'
// useMessage.ts
import { useContext } from 'react'

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context.showFeedback
}
