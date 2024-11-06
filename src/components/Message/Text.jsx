import { useEffect, useRef, useMemo } from "react";
import MarkdownIt from "markdown-it";
import MdKatex from "@vscode/markdown-it-katex";
import MdLinkAttributes from "markdown-it-link-attributes";
import MdMermaid from "mermaid-it-markdown";
import hljs from "highlight.js";
import Clipboard from "clipboard";
import "./style.less";
const mdi = new MarkdownIt({
    html: false,
    linkify: true,
    highlight(code, language) {
        const validLang = !!(language && hljs.getLanguage(language));
        if (validLang) {
            const lang = language ?? "";
            return highlightBlock(hljs.highlight(code, { language: lang }).value, lang);
        }
        return highlightBlock(hljs.highlightAuto(code).value, "");
    },
});
mdi
    .use(MdLinkAttributes, { attrs: { target: "_blank", rel: "noopener" } })
    .use(MdKatex)
    .use(MdMermaid);
function highlightBlock(str, lang) {
    return `<pre class="code-block-wrapper"><div class="flex items-center justify-between copy-row pb-1"><span class="code-block-header__lang">${lang}</span><button class="copy-btn">复制代码</button></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`;
}
function MarkdownBody(info) {
    const { text, loading } = info;
    if (!text) {
        return null;
    }
    return <div className={`markdown-body ${loading ? "markdown-body-generate" : ""}`} dangerouslySetInnerHTML={{ __html: text }}/>;
}
function escapeDollarNumber(text) {
    let escapedText = "";
    for (let i = 0; i < text.length; i += 1) {
        let char = text[i];
        const nextChar = text[i + 1] || " ";
        if (char === "$" && nextChar >= "0" && nextChar <= "9")
            char = "\\$";
        escapedText += char;
    }
    return escapedText;
}
function escapeBrackets(text) {
    const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
    return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
        if (codeBlock)
            return codeBlock;
        else if (squareBracket)
            return `$$${squareBracket}$$`;
        else if (roundBracket)
            return `$${roundBracket}$`;
        return match;
    });
}
function Text(props) {
    const { inversion, text, loading } = props;
    const textRef = useRef(null);
    const escapedText = useMemo(() => {
        const value = text ?? "";
        if (!inversion) {
            // 对数学公式进行处理，自动添加 $$ 符号
            const escapedValue = escapeBrackets(escapeDollarNumber(value));
            return mdi.render(escapedValue);
        }
        return value;
    }, [inversion, text]);
    useEffect(() => {
        if (textRef.current) {
            const clipboard = new Clipboard(".copy-btn", {
                text: (trigger) => {
                    // 在这里获取代码块的内容
                    const codeBlock = trigger.parentElement?.nextElementSibling;
                    return codeBlock ? codeBlock.textContent || "" : "";
                },
            });
            clipboard.on("success", () => {
                console.log("Code copied to clipboard!");
            });
            clipboard.on("error", () => {
                console.log("Failed to copy code.");
            });
            return () => {
                clipboard.destroy();
            };
        }
    }, [textRef]);
    return (<div className='text-black text-wrap message-request w-full overflow-hidden'>
			<div ref={textRef} className='leading-relaxed break-words'>
				<div className='leading-relaxed break-words'>{inversion ? <div className='whitespace-pre-wrap'>{text}</div> : <MarkdownBody text={escapedText} loading={loading}/>}</div>
			</div>
		</div>);
}
export default Text;
