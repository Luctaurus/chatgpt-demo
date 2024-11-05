// MessageFeedback.tsx
import React, { useState } from "react"
import { Snackbar, Alert } from "@mui/material"
import { FeedbackContext, Feedback } from "./feedback" // 从messageContext中导入

// MessageProvider 组件
export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [open, setOpen] = useState(false)
	const [message, setMessage] = useState<Feedback | null>(null)

	// 展示消息
	const showFeedback = (msg: Feedback) => {
		setMessage(msg)
		setOpen(true)
	}

	// 关闭消息
	const handleClose = () => {
		setOpen(false)
		setMessage(null)
	}

	return (
		<FeedbackContext.Provider value={{ showFeedback }}>
			{children}
			{message && (
				<Snackbar open={open} autoHideDuration={message.duration || 500} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
					<Alert onClose={handleClose} severity={message.severity} sx={{ width: "100%" }}>
						{message.message}
					</Alert>
				</Snackbar>
			)}
		</FeedbackContext.Provider>
	)
}
