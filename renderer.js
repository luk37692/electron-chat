const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.getElementById('chat-container');

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-card');
    
    if (type === 'sent') {
        messageDiv.classList.add('message-sent');
    } else {
        messageDiv.classList.add('message-received');
    }
    
    messageDiv.innerText = text;
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
        addMessage(text, 'sent');
        window.electronAPI.sendMessage(text);
        messageInput.value = '';
    }
});

// Allow pressing Enter to send
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

window.electronAPI.onMessage((value) => {
    addMessage(value, 'received');
});