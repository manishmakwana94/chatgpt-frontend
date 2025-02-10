import React, { useState } from 'react';
import axios from 'axios';
import '../../src/App.css';

function Chat() {
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleMessageChange = (e) => {
        setUserMessage(e.target.value);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSendMessage = async () => {
        if (!userMessage.trim() && !selectedFile) return; 
    
        setLoading(true);
        let newMessage = null;
    
        if (selectedFile) {
            newMessage = { sender: 'user', content: `Uploaded: ${selectedFile.name}` };
            setChatHistory((prev) => [...prev, newMessage]);
    
            const formData = new FormData();
            formData.append("file", selectedFile);
            console.log('formData',formData)
            try {
                const response = await axios.post('http://localhost:5000/summarize', formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
    
                const botMessage = {
                    sender: 'bot',
                    content: response?.data?.summary || "Couldn't summarize this PDF.",
                };
                setChatHistory((prev) => [...prev, botMessage]);
    
                document.getElementById("fileInput").value = "";
            } catch (error) {
                console.error('Error summarizing PDF', error);
                setError('Failed to summarize PDF.');
            }
        } else {
            newMessage = { sender: 'user', content: userMessage };
            setChatHistory((prev) => [...prev, newMessage]);
    
            try {
                const response = await axios.post('http://localhost:5000/chat', { userMessage });
                const botMessage = {
                    sender: 'bot',
                    content: response?.data?.message,
                };
                setChatHistory((prev) => [...prev, botMessage]);
            } catch (error) {
                console.error('Error sending message', error);
                setError('Oops! Something went wrong.');
            }
        }
    
        setUserMessage('');
        setSelectedFile(null);
        setLoading(false);
    };
    

    return (
        <div className="App">
            <h1>Chat with GPT & PDF Summarizer</h1>
            <div className="chatbox">
                {chatHistory.map((message, index) => (
                    <div key={index} className={message.sender}>
                        <strong>{message.sender === 'user' ? 'You' : 'Bot'}: </strong>
                        {message.content}
                    </div>
                ))}
                {loading && <div className="loading">Bot is typing...</div>}
            </div>

            {error && <div className="error">{error}</div>}

            <div className="input-area">
                <input
                    type="text"
                    value={userMessage}
                    onChange={handleMessageChange}
                    placeholder="Type your message..."
                />
                <input type="file"  id="fileInput" accept=".pdf,.txt,image/*" onChange={handleFileChange} />
                <button onClick={handleSendMessage} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default Chat;
