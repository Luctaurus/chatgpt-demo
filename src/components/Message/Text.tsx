import MdKatex from '@vscode/markdown-it-katex'
import Clipboard from 'clipboard'
import hljs from 'highlight.js'
import ReactHtmlParser from 'html-react-parser'
import MarkdownIt from 'markdown-it'
import MdLinkAttributes from 'markdown-it-link-attributes'
import MdMermaid from 'mermaid-it-markdown'
import { useEffect, useMemo, useRef } from 'react'
import './style.less'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
}

type MarkdownInfo = Pick<Props, 'text' | 'loading'>

const mdi = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi
  .use(MdLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })
  .use(MdKatex)
  .use(MdMermaid)

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="flex items-center justify-between copy-row pb-1"><span class="code-block-header__lang">${lang}</span><button class="copy-btn">复制代码</button></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

function MarkdownBody(info: MarkdownInfo) {
  const { text, loading } = info
  if (text == null) {
    return null
  }

  return <div className={`markdown-body ${loading ? 'markdown-body-generate' : ''}`}>{ReactHtmlParser(text)}</div>
}

function escapeDollarNumber(text: string) {
  let escapedText = ''

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i]
    const nextChar = text[i + 1] || ' '
    if (char === '$' && nextChar >= '0' && nextChar <= '9')
      char = '\\$'
    escapedText += char
  }
  return escapedText
}

function escapeBrackets(text: string) {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g
  return text.replace(
    pattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      if (typeof codeBlock === 'string') {
        return codeBlock
      }
      else if (typeof squareBracket === 'string') {
        return `$$${squareBracket}$$`
      }
      else if (typeof roundBracket === 'string') {
        return `$${roundBracket}$`
      }
      return match
    },
  )
}

function Text(props: Props) {
  const { inversion, text, loading } = props
  const textRef = useRef<HTMLDivElement | null>(null)

  const escapedText = useMemo(() => {
    const value = text ?? ''
    if (!inversion) {
      // 对数学公式进行处理，自动添加 $$ 符号
      const escapedValue = escapeBrackets(escapeDollarNumber(value))
      return mdi.render(escapedValue)
    }
    return value
  }, [inversion, text])

  useEffect(() => {
    if (textRef.current) {
      const clipboard = new Clipboard('.copy-btn', {
        text: (trigger) => {
          // 在这里获取代码块的内容
          const codeBlock = trigger.parentElement?.nextElementSibling
          return codeBlock && (codeBlock.textContent != null) ? codeBlock.textContent || '' : ''
        },
      })
      return () => {
        clipboard.destroy()
      }
    }
  }, [textRef])
  return (
    <div className="text-black text-wrap message-request w-full overflow-hidden">
      <div ref={textRef} className="leading-relaxed break-words">
        <div className="leading-relaxed break-words">{inversion ? <div className="whitespace-pre-wrap">{text}</div> : <MarkdownBody text={escapedText} loading={loading} />}</div>
      </div>
    </div>
  )
}
export default Text
