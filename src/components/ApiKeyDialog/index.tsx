import { Button, Input, Modal, Typography } from 'antd'
import React, { useState } from 'react'

const { Text } = Typography

const ApiKeyDialog: React.FC<{ open: boolean, onSubmit: (apiKey: string) => void }> = ({ open, onSubmit }) => {
  const [inputValue, setInputValue] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleSubmitClick = () => {
    onSubmit(inputValue)
  }

  return (
    <Modal
      open={open}
      closable={false}
      centered
      title="输入 OpenAI API Key"
      footer={[
        <Button key="submit" type="primary" onClick={handleSubmitClick}>
          提交
        </Button>,
      ]}
    >
      <Text>
        请在下面的输入框中输入您的 OpenAI API Key 使用 ChatGPT。此密钥将被安全存储在您的浏览器中。
      </Text>
      <Input
        autoFocus
        placeholder="请输入 API Key"
        value={inputValue}
        onChange={handleInputChange}
        style={{ marginTop: 16 }}
      />
    </Modal>
  )
}

export default ApiKeyDialog
