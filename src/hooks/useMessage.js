import { useReducer } from "react";
// 初始状态
const initialChatMessages = [];
// 定义reducer函数
const chatMessagesReducer = (state, action) => {
    switch (action.type) {
        case "ADD_MESSAGE": {
            return [...state, ...action.payload];
        }
        case "UPDATE_ASSISTANT_MESSAGE": {
            const lastMessage = state[state.length - 1];
            return [...state.slice(0, -1), { ...lastMessage, content: lastMessage.content + action.payload }];
        }
        case "DONE_ASSISTANT_MESSAGE": {
            const updatedMessages = state.slice();
            if (updatedMessages.length > 0) {
                updatedMessages[updatedMessages.length - 1].pending = false;
            }
            return updatedMessages;
        }
        default:
            return state;
    }
};
const useMessage = () => {
    const [chatMessages, dispatch] = useReducer(chatMessagesReducer, initialChatMessages);
    // 添加对话
    const addMessage = (messages) => {
        dispatch({ type: "ADD_MESSAGE", payload: messages });
    };
    // 持续更新最新一条AI回答
    const updateMessage = (msg) => {
        dispatch({ type: "UPDATE_ASSISTANT_MESSAGE", payload: msg.content });
    };
    // 结束对话
    const doneMessage = () => {
        dispatch({ type: "DONE_ASSISTANT_MESSAGE" });
    };
    return {
        chatMessages,
        addMessage,
        updateMessage,
        doneMessage,
    };
};
export default useMessage;
