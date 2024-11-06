/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchEventSource } from "@microsoft/fetch-event-source";
const EventStreamContentType = "text/event-stream";
const defaultHeaders = {
    "Content-Type": "application/json",
};
const openAIApiUrl = "https://openrouter.ai/api/v1/chat/completions";
export function fetchChatGpt(options) {
    const { apiKey, messages, onMessage, onClose, onDone, onError } = options;
    const ctrl = new AbortController(); //用于中断请求
    return {
        // 可以通过此函数建立连接
        open: () => {
            fetchEventSource(openAIApiUrl, {
                method: "POST",
                headers: { ...defaultHeaders, Authorization: `Bearer ${apiKey}` },
                body: JSON.stringify({
                    stream: true,
                    model: "mistralai/mistral-7b-instruct:free",
                    messages: messages,
                    transforms: ["middle-out"],
                    max_tokens: 0,
                }),
                signal: ctrl.signal,
                async onopen(response) {
                    if (response.ok && response.headers.get("content-type") === EventStreamContentType) {
                        return; // everything's good
                    }
                    else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                        // client-side errors are usually non-retriable:
                        if (onError) {
                            onError("发生错误，请稍后再试");
                        }
                        else {
                            alert("发生错误，请稍后再试");
                        }
                    }
                    else {
                        if (onError) {
                            onError("发生错误，请稍后再试");
                        }
                        else {
                            alert("发生错误，请稍后再试");
                        }
                    }
                    ctrl.abort();
                    onDone();
                },
                onmessage(msg) {
                    if (msg.event === "FatalError") {
                        alert("发生错误，请稍后再试");
                        ctrl.abort();
                        onDone();
                        return;
                    }
                    if (msg.data === "[DONE]") {
                        console.log("DONE");
                        ctrl.abort();
                        onDone();
                        return;
                    }
                    const jsonData = JSON.parse(msg.data);
                    // 如果等于stop表示结束
                    if (jsonData.choices[0].finish_reason === "stop") {
                        console.log("STOP");
                        ctrl.abort();
                        onMessage(jsonData.choices[0].delta);
                        onDone();
                        return;
                    }
                    if (jsonData && jsonData.choices?.length && jsonData.choices[0].delta && jsonData.choices[0].delta.content !== undefined) {
                        onMessage(jsonData.choices[0].delta);
                    }
                },
                onclose() {
                    // if the server closes the connection expectedly, abort:
                    if (onClose)
                        onClose();
                    ctrl.abort();
                },
                onerror(err) {
                    if (onError) {
                        onError(err.msg);
                    }
                    else {
                        alert(err.msg);
                    }
                    ctrl.abort();
                },
            });
        },
        // 可以通过此函数手动中断请求
        abort: () => {
            ctrl.abort();
        },
    };
}
