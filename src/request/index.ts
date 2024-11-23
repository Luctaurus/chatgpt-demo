import { fetchEventSource } from '@microsoft/fetch-event-source'

export interface ChatClient {
  open: () => void
  abort: () => void
}

interface Options {
  apiKey?: string
  messages?: Message[]
  onMessage: (msg: Message) => void
  onDone: () => void
  onClose?: () => void
  onError: (err?: string) => void
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface Delta {
  delta?: {
    content?: string
  }
  finish_reason?: string
}

interface Err {
  msg: string
}

const EventStreamContentType = 'text/event-stream'

const defaultHeaders = {
  'Content-Type': 'application/json',
}

const model = import.meta.env.VITE_OPEN_ROUTER_MODEL as string

const openAIApiUrl = import.meta.env.VITE_Open_AI_Api_Url as string

export function fetchChatGpt(options: Options): ChatClient {
  const { apiKey, messages, onMessage, onClose, onDone, onError } = options
  const ctrl = new AbortController() // 用于中断请求
  return {
    // 可以通过此函数建立连接
    open: () => {
      void fetchEventSource(openAIApiUrl, {
        method: 'POST',
        headers: { ...defaultHeaders, Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          stream: true,
          model,
          messages,
          transforms: ['middle-out'],
          max_tokens: 0,
        }),
        signal: ctrl.signal,
        async onopen(response) {
          if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            // everything's good
          }
          else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // client-side errors are usually non-retriable:
            ctrl.abort()
            onError()
          }
          else {
            ctrl.abort()
            onError()
          }
        },
        onmessage(msg) {
          if (msg.event === 'FatalError') {
            ctrl.abort()
            onError()
            return
          }
          if (msg.data === '[DONE]') {
            ctrl.abort()
            onDone()
            return
          }
          if (msg.data) {
            const jsonData = JSON.parse(msg.data) as { choices: Delta[] }
            // 如果等于stop表示结束
            if (jsonData.choices[0].finish_reason === 'stop') {
              ctrl.abort()
              onMessage(jsonData.choices[0].delta as Message)
              onDone()
              return
            }
            if (jsonData.choices?.length
              && jsonData.choices[0].delta
              && jsonData.choices[0].delta.content !== undefined) {
              onMessage(jsonData.choices[0].delta as Message)
            }
          }
        },
        onclose() {
          // if the server closes the connection expectedly, abort:
          if (onClose)
            onClose()
          ctrl.abort()
        },
        onerror(err: Err) {
          ctrl.abort()
          onError(err.msg)
        },
      })
    },
    // 可以通过此函数手动中断请求
    abort: () => {
      ctrl.abort()
    },
  }
}
