import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { FeedbackProvider } from "@/components/MessageFeedback" // 从MessageFeedback导入
import "./index.css"
import App from "./App"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<FeedbackProvider>
			<App />
		</FeedbackProvider>
	</StrictMode>
)
