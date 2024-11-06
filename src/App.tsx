import { useState, KeyboardEventHandler, useRef } from "react"
import Message from "@/components/Message"
import ApiKeyDialog from "@/components/ApiKeyDialog"
import { TextField, IconButton } from "@mui/material"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import SquareIcon from "@mui/icons-material/Square"
import { styled } from "@mui/material/styles"
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom"
import useMessage, { ChatMessage } from "@/hooks/useMessage"
import useOpenAIApiKey from "@/hooks/useOpenAIApiKey"
import { ChatClient, fetchChatGpt } from "./request"
import { useFeedback } from "@/hooks/useFeedback"
import "./App.css"

const StyledButton = styled(IconButton)({
	strokeWidth: 1.5,
	flexShrink: 0,
	height: "2rem",
	width: "2rem",
	"&:disabled": {
		backgroundColor: "rgb(215, 215, 215)", // 设置按钮禁用状态下的背景色，替换为你想要的颜色
		color: "rgb(244, 244, 244)",
	},
	"&:hover": {
		opacity: 0.7,
		backgroundColor: "#000000", // 设置按钮正常状态下的背景色，替换为你想要的颜色
		color: "#ffffff",
	},
	padding: 0,
	backgroundColor: "#000000", // 设置按钮正常状态下的背景色，替换为你想要的颜色
	color: "#ffffff",
})

function ScrollToBottom() {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext()
	if (isAtBottom) {
		return null
	} else {
		return (
			<div className='cursor-pointer absolute z-10 text-[#5d5d5d] bg-[#ffffff] rounded-full bg-clip-padding border right-1/2 translate-x-1/2 w-8 h-8 flex items-center justify-center bottom-5' onClick={() => scrollToBottom()}>
				<IconButton>
					<ArrowDownwardIcon />
				</IconButton>
			</div>
		)
	}
}

const App: React.FC = () => {
	const { apiKey, openDialog, handleSubmit } = useOpenAIApiKey()
	const [question, setQuestion] = useState<string>("")
	const { addMessage, updateMessage, doneMessage, chatMessages } = useMessage()
	const [isLoading, setIsLoading] = useState(false)

	// Chat组件
	const messageItem = chatMessages.map((item, index) => {
		const inversion = item.role === "user"
		return <Message key={index} text={item.content} inversion={inversion} loading={item.pending} />
	})

	// 监听回车事件
	const handleEnter: KeyboardEventHandler<HTMLDivElement> = (event): void => {
		if (event.key === "Enter" && !event.shiftKey && !isLoading) {
			event.preventDefault()
			addChat(apiKey, question)
			setQuestion("")
		}
	}

	// 添加或者暂停对话
	const handleClick = () => {
		if (isLoading) {
			stopChat()
		} else {
			addChat(apiKey, question)
			setQuestion("")
		}
	}

	// 保存SSE连接
	const fetchRef = useRef<ChatClient | null>(null)
	// fetchChatGpt onDone回调
	const onDone = () => {
		doneMessage()
		setIsLoading(false)
	}
	const showFeedback = useFeedback()
	const handleError = (msg?: string) => {
		showFeedback({
			message: msg || "发生错误，请稍后再试。",
			severity: "error",
		})
	}
	// 添加对话(一条user，一条初始化ai回答)
	const addChat = (apiKey: string, content: string) => {
		if (!apiKey) {
			showFeedback({
				message: "请刷新后提交OpenAI API Key使用ChatGpt",
				severity: "warning",
			})
			return
		}
		const userMessage: ChatMessage = { role: "user", content }
		const initAssistantMessage: ChatMessage = { role: "assistant", content: "", pending: true }
		addMessage([userMessage, initAssistantMessage])
		fetchRef.current = fetchChatGpt({
			apiKey,
			messages: [...chatMessages, userMessage],
			onMessage: updateMessage,
			onDone,
			onError: handleError,
		})
		fetchRef.current.open()
		setIsLoading(true)
	}

	//终止回答
	const stopChat = () => {
		if (fetchRef.current) {
			fetchRef.current.abort()
			onDone()
		}
	}

	return (
		<>
			<div className='flex h-full flex-col'>
				<div className='flex-1 overflow-hidden'>
					<div className='h-full w-full relative overflow-y-auto'>
						<StickToBottom className='h-full relative' resize='smooth' initial='smooth'>
							<StickToBottom.Content className='flex flex-col gap-4'>{messageItem}</StickToBottom.Content>
							<ScrollToBottom />
						</StickToBottom>
					</div>
				</div>
				<div className='md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent w-full'>
					<div className='m-auto text-base px-3 w-full md:px-5 lg:px-4 xl:px-5'>
						<div className='mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]'>
							<div className='group relative flex w-full items-center'>
								<div className='flex w-full flex-col transition-colors contain-inline-size gap-1.5 rounded-[26px] p-3 bg-[#f4f4f4]'>
									<div className='flex items-end gap-1.5 pl-4 md:gap-2'>
										<div className='flex min-w-0 flex-1 flex-col'>
											<div className='text-token-text-primary max-h-52 overflow-auto'>
												<TextField value={question} onKeyDown={handleEnter} onChange={(e) => setQuestion(e.target.value)} id='outlined-textarea' variant='standard' slotProps={{ input: { disableUnderline: true } }} className='block w-full resize-none border-0 bg-transparent px-0 text-token-text-primary placeholder:text-token-text-secondary' placeholder='给“ChatGPT”发送消息' multiline />
											</div>
										</div>
										<div className='me-1'>
											<StyledButton disabled={!isLoading && !question} onClick={handleClick}>
												{isLoading ? <SquareIcon fontSize='small' /> : <ArrowUpwardIcon />}
											</StyledButton>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='relative w-full px-2 py-2 text-center text-xs text-token-text-secondary empty:hidden md:px-[60px]'>
						<div className='min-h-4'>
							<div>ChatGPT 也可能会犯错。请核查重要信息。</div>
						</div>
					</div>
				</div>
			</div>
			<ApiKeyDialog open={openDialog} onSubmit={handleSubmit} />
		</>
	)
}

export default App
