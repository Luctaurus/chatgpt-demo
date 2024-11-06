import React, { useState } from "react";
import { TextField, Button, Dialog, Typography, DialogActions, DialogContent, DialogTitle } from "@mui/material";
const ApiKeyDialog = ({ open, onSubmit }) => {
    const [inputValue, setInputValue] = useState("");
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };
    const handleSubmitClick = () => {
        onSubmit(inputValue);
    };
    return (<Dialog open={open} onClose={() => { }} // 阻止通过外部点击关闭
     aria-labelledby='api-key-dialog-title' aria-describedby='api-key-dialog-description'>
			<DialogTitle id='api-key-dialog-title'>输入 OpenAI API Key</DialogTitle>
			<DialogContent>
				<Typography variant='body1' gutterBottom>
					请在下面的输入框中输入您的 OpenAI API Key使用ChatGpt。此密钥将被安全存储在您的浏览器中。
				</Typography>
				<TextField autoFocus margin='dense' label='API Key' type='text' fullWidth variant='outlined' value={inputValue} onChange={handleInputChange}/>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleSubmitClick} color='primary' variant='contained'>
					提交
				</Button>
			</DialogActions>
		</Dialog>);
};
export default ApiKeyDialog;
