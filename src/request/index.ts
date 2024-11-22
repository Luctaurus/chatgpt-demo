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
  onError?: (err: any) => void
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

const MODEL = 'nousresearch/hermes-3-llama-3.1-405b:free'

const openAIApiUrl = 'https://openrouter.ai/api/v1/chat/completions'

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
          model: MODEL,
          messages,
          transforms: ['middle-out'],
          max_tokens: 0,
        }),
        signal: ctrl.signal,
        async onopen(response) {
          if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
            return // everything's good
          }
          else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // client-side errors are usually non-retriable:
            if (onError) {
              onError('发生错误，请稍后再试1')
              ctrl.abort()
            }
            else {
              alert('发生错误，请稍后再试')
            }
          }
          else {
            if (onError) {
              onError('发生错误，请稍后再试2')
              ctrl.abort()
            }
            else {
              alert('发生错误，请稍后再试')
            }
          }
          ctrl.abort()
          onDone()
        },
        onmessage(msg) {
          if (msg.event === 'FatalError') {
            alert('发生错误，请稍后再试')
            ctrl.abort()
            onDone()
            return
          }
          if (msg.data === '[DONE]') {
            ctrl.abort()
            onDone()
            return
          }
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
        },
        onclose() {
          // if the server closes the connection expectedly, abort:
          if (onClose)
            onClose()
          ctrl.abort()
        },
        onerror(err: Err) {
          if (onError) {
            onError(err.msg)
          }
          else {
            alert(err.msg)
          }
          ctrl.abort()
        },
      })
    },
    // 可以通过此函数手动中断请求
    abort: () => {
      ctrl.abort()
    },
  }
}
