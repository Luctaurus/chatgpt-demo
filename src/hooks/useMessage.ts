import { useReducer } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  // ContentParts are only for the 'user' role:
  content: string
  pending?: boolean
}

// 定义会话内容列表类型，就是一个ChatMessage数组
type ChatMessages = ChatMessage[]

// 定义动作类型
type Action = { type: 'ADD_MESSAGE', payload: ChatMessages } | { type: 'UPDATE_ASSISTANT_MESSAGE', payload: string } | { type: 'DONE_ASSISTANT_MESSAGE' }

// 初始状态
const initialChatMessages: ChatMessages = []

// 定义reducer函数
function chatMessagesReducer(state: ChatMessages, action: Action): ChatMessages {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      return [...state, ...action.payload]
    }
    case 'UPDATE_ASSISTANT_MESSAGE': {
      const lastMessage = state[state.length - 1]
      return [...state.slice(0, -1), { ...lastMessage, content: lastMessage.content + action.payload }]
    }
    case 'DONE_ASSISTANT_MESSAGE': {
      const updatedMessages = state.slice()
      if (updatedMessages.length > 0) {
        updatedMessages[updatedMessages.length - 1].pending = false
      }
      return updatedMessages
    }
    default:
      return state
  }
}

function useMessage() {
  const [chatMessages, dispatch] = useReducer(chatMessagesReducer, initialChatMessages)
  // 添加对话
  const addMessage = (messages: ChatMessages) => {
    dispatch({ type: 'ADD_MESSAGE', payload: messages })
  }
  // 持续更新最新一条AI回答
  const updateMessage = (msg: ChatMessage) => {
    dispatch({ type: 'UPDATE_ASSISTANT_MESSAGE', payload: msg.content })
  }
  // 结束对话
  const doneMessage = () => {
    dispatch({ type: 'DONE_ASSISTANT_MESSAGE' })
  }

  return {
    chatMessages,
    addMessage,
    updateMessage,
    doneMessage,
  }
}

export default useMessage
