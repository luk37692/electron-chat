import React from 'react';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';

const ChatPage = ({ messages, inputValue, setInputValue, handleSend, handleAttachFile, attachedFile, setAttachedFile, settings }) => {
    return (
        <>
            <MessageList messages={messages} />
            <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSend={handleSend}
                handleAttachFile={handleAttachFile}
                attachedFile={attachedFile}
                setAttachedFile={setAttachedFile}
                settings={settings}
            />
        </>
    );
};

export default ChatPage;
