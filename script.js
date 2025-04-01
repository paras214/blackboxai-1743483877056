// Online/Offline functionality
let isOnline = true;
const onlineBtn = document.getElementById('online-btn');
const offlineBtn = document.getElementById('offline-btn');
const offlineStatus = document.getElementById('offline-status');

// Check network status
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function updateNetworkStatus() {
    isOnline = navigator.onLine;
    if (!isOnline) {
        offlineStatus.classList.remove('hidden');
        onlineBtn.classList.remove('bg-blue-500', 'text-white');
        offlineBtn.classList.add('bg-blue-500', 'text-white');
    } else {
        offlineStatus.classList.add('hidden');
        onlineBtn.classList.add('bg-blue-500', 'text-white');
        offlineBtn.classList.remove('bg-blue-500', 'text-white');
        syncPendingMessages();
    }
}

// Chat functionality
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Sample engineering contacts
const engineeringContacts = [
    { id: 1, name: "Alex (Power Systems)", avatar: "👨‍💻" },
    { id: 2, name: "Priya (Control Systems)", avatar: "👩‍🔧" },
    { id: 3, name: "Rahul (Circuit Design)", avatar: "👨‍🔬" },
    { id: 4, name: "Dr. Smith (Professor)", avatar: "👨‍🏫" }
];

// Load initial messages
loadMessages();

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    const message = {
        id: Date.now(),
        text: messageText,
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: isOnline ? "sent" : "pending"
    };

    addMessageToUI(message);
    messageInput.value = '';
    storeMessage(message);

    if (isOnline) {
        sendToServer(message);
    }
}

function addMessageToUI(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${message.sender === "You" ? 'justify-end' : 'justify-start'}`;
    
    messageDiv.innerHTML = `
        <div class="max-w-xs md:max-w-md rounded-lg p-3 ${message.sender === "You" ? 'bg-blue-500 text-white' : 'bg-gray-200'}">
            <div class="flex items-center mb-1">
                <span class="mr-2">${message.sender === "You" ? '👤' : engineeringContacts.find(c => c.name.includes(message.sender))?.avatar || '👥'}</span>
                <span class="font-semibold">${message.sender}</span>
                <span class="text-xs opacity-70 ml-2">${message.timestamp}</span>
            </div>
            <p>${message.text}</p>
            ${message.status === 'pending' ? '<div class="text-xs mt-1"><i class="fas fa-clock"></i> Sending when online...</div>' : ''}
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function storeMessage(message) {
    let messages = JSON.parse(localStorage.getItem('engineering-chat')) || [];
    messages.push(message);
    localStorage.setItem('engineering-chat', JSON.stringify(messages));
}

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('engineering-chat')) || [];
    
    if (messages.length === 0) {
        const sampleMessages = [
            {
                id: 1,
                text: "Welcome to EE 2023 Group Chat!",
                sender: "System",
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                status: "sent"
            },
            {
                id: 2,
                text: "Has everyone completed the circuit design assignment?",
                sender: "Alex (Power Systems)",
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                status: "sent"
            }
        ];
        
        sampleMessages.forEach(msg => {
            addMessageToUI(msg);
            storeMessage(msg);
        });
        return;
    }
    
    messages.forEach(msg => addMessageToUI(msg));
}

function sendToServer(message) {
    // Simulate API call
    console.log("Sending to server:", message);
    setTimeout(() => {
        updateMessageStatus(message.id, "delivered");
    }, 1000);
}

function updateMessageStatus(messageId, status) {
    let messages = JSON.parse(localStorage.getItem('engineering-chat')) || [];
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
        messages[messageIndex].status = status;
        localStorage.setItem('engineering-chat', JSON.stringify(messages));
        refreshChatUI();
    }
}

function syncPendingMessages() {
    const messages = JSON.parse(localStorage.getItem('engineering-chat')) || [];
    const pendingMessages = messages.filter(m => m.status === "pending");
    
    pendingMessages.forEach(msg => {
        sendToServer(msg);
    });
}

function refreshChatUI() {
    chatContainer.innerHTML = '';
    loadMessages();
}

// Initialize
updateNetworkStatus();