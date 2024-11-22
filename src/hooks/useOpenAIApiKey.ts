import { useEffect, useState } from 'react'

function useOpenAIApiKey() {
  const [apiKey, setApiKey] = useState<string>('')
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openAIApiKey')
    if (storedApiKey != null) {
      setApiKey(storedApiKey)
    }
    else {
      setOpenDialog(true) // 如果没有找到密钥，打开对话框
    }
  }, [])

  const handleSubmit = (newApiKey: string) => {
    localStorage.setItem('openAIApiKey', newApiKey)
    setApiKey(newApiKey)
    setOpenDialog(false) // 提交后关闭对话框
  }

  const handleClose = () => {
    setOpenDialog(false) // 关闭对话框
  }

  return {
    apiKey,
    openDialog,
    handleSubmit,
    handleClose,
  }
}

export default useOpenAIApiKey
