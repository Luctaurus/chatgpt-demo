import type { Feedback } from './feedback'
import { message } from 'antd'
import React, { useMemo } from 'react'
import { FeedbackContext } from './feedback' // 从messageContext中导入

// MessageProvider 组件
export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage()

  // 展示消息
  const feedbackObj = useMemo(() => ({
    showFeedback: (msg: Feedback) => {
      const { type = 'success', content, duration = 3, onClose } = msg
      messageApi[type](content, duration, onClose)
    },
  }), [messageApi])

  return (
    <FeedbackContext.Provider value={feedbackObj}>
      {contextHolder}
      {children}
    </FeedbackContext.Provider>
  )
}
