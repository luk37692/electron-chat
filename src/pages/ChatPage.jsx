import React from 'react';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';

const ChatPage = ({
    messages,
    inputValue,
    setInputValue,
    handleSend,
    handleAttachFile,
    attachedFile,
    setAttachedFile,
    settings,
    onSettingsChange,
    isGenerating
}) => {
    // Handle suggestion card clicks from empty state
    const handleSuggestionClick = (prompt) => {
        setInputValue(prompt);
    };

    return (
        <>
            <MessageList
                messages={messages}
                isGenerating={isGenerating}
                onSuggestionClick={handleSuggestionClick}
            />
            <ChatInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSend={handleSend}
                handleAttachFile={handleAttachFile}
                attachedFile={attachedFile}
                setAttachedFile={setAttachedFile}
                settings={settings}
                onSettingsChange={onSettingsChange}
            />
        </>
    );
};

export default ChatPage;

