import { useReducer, useRef, useState } from "react"
import { fetchChatGpt, ChatClient } from "@/request"

type ChatMessage = {
	role: "user" | "assistant" | "system"
	// ContentParts are only for the 'user' role:
	content: string
	pending?: boolean
}

// 定义会话内容列表类型，就是一个ChatMessage数组
type ChatMessages = ChatMessage[]

// 定义动作类型
type Action = { type: "ADD_MESSAGE"; payload: ChatMessages } | { type: "UPDATE_ASSISTANT_MESSAGE"; payload: string } | { type: "DONE_ASSISTANT_MESSAGE" }

// 初始状态
const initialChatMessages: ChatMessages = []

// 定义reducer函数
const chatMessagesReducer = (state: ChatMessages, action: Action): ChatMessages => {
	switch (action.type) {
		case "ADD_MESSAGE": {
			return [...state, ...action.payload]
		}
		case "UPDATE_ASSISTANT_MESSAGE": {
			const lastMessage = state[state.length - 1]
			return [...state.slice(0, -1), { ...lastMessage, content: lastMessage.content + action.payload }]
		}
		case "DONE_ASSISTANT_MESSAGE": {
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

const useMessage = () => {
	const [chatMessages, dispatch] = useReducer(chatMessagesReducer, initialChatMessages)
	const [isLoading, setIsLoading] = useState(false)
	const fetchRef = useRef<ChatClient | null>(null)
	const onMessage = (msg: ChatMessage) => {
		dispatch({ type: "UPDATE_ASSISTANT_MESSAGE", payload: msg.content })
	}
	const onDone = () => {
		dispatch({ type: "DONE_ASSISTANT_MESSAGE" })
		setIsLoading(false)
	}
	const addChat = (apiKey: string, content: ChatMessage["content"]) => {
		const userMessage: ChatMessage = { role: "user", content }
		const initAssistantMessage: ChatMessage = { role: "assistant", content: "", pending: true }
		dispatch({ type: "ADD_MESSAGE", payload: [userMessage, initAssistantMessage] })
		fetchRef.current = fetchChatGpt({ apiKey, messages: [...chatMessages, userMessage], onMessage, onDone })
		fetchRef.current.open()
		setIsLoading(true)
	}

	const stopChat = () => {
		if (fetchRef.current) {
			fetchRef.current.abort()
			onDone()
		}
	}

	return {
		chatMessages,
		addChat,
		stopChat,
		isLoading
	}
}

export default useMessage
