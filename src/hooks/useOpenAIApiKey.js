import { useEffect, useState } from "react";
const useOpenAIApiKey = () => {
    const [apiKey, setApiKey] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    useEffect(() => {
        const storedApiKey = localStorage.getItem('openAIApiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
        else {
            setOpenDialog(true); // 如果没有找到密钥，打开对话框
        }
    }, []);
    const handleSubmit = (newApiKey) => {
        localStorage.setItem('openAIApiKey', newApiKey);
        setApiKey(newApiKey);
        setOpenDialog(false); // 提交后关闭对话框
    };
    const handleClose = () => {
        setOpenDialog(false); // 关闭对话框
    };
    return {
        apiKey,
        openDialog,
        handleSubmit,
        handleClose
    };
};
export default useOpenAIApiKey;
