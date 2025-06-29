// Stops marked (the markdown parser) not working as it is loaded client-side
// rather than from npm
if (typeof marked === 'undefined' && window.marked) {
    marked = window.marked;
}

// Sets marked options for better markdown rendering
marked.setOptions({
    breaks: true, // Enable line breaks in markdown
    gfm: true, // Enable GitHub Flavored Markdown (so it is formatted like GitHub)
    smartypants: true // Enable smart punctuation
});

// Make sure the user is logged in before accessing the AI
document.addEventListener('DOMContentLoaded', function () {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        loadChatHistory(user);

        document.getElementById('messageForm').addEventListener('submit', (e) => {
            sendMessage(e, user);
        });

        // Make the sample questions below the input box send their text as a prompt
        document.querySelectorAll('.sample-question').forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const questionText = this.textContent.trim();
                document.getElementById('userInput').value = questionText;

                const user = firebase.auth().currentUser;
                if (user) {
                    sendMessage(e, user);
                }
            });
        });

        document.getElementById('clearChat').addEventListener('click', function () {
            clearChat(user);
        });
    });

    // Clear chat history when the user clicks the "Clear Chat" button
    function clearChat(user) {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <p>Hello! I'm your AI financial assistant. How can I help you today?</p>
                </div>
            </div>
        `;

        firebase.database().ref('chats/' + user.uid).remove();
    }

    // Load chat history from Firebase when the user logs in and display it
    function loadChatHistory(user) {
        const chatRef = firebase.database().ref('chats/' + user.uid);
        chatRef.once('value').then(snapshot => {
            const chat = snapshot.val() || {};
            Object.entries(chat).forEach(([key, msg]) => {
                appendMessage(msg.sender, msg.message);
            });
        });
    }

    // Whether the AI is currently typing a response
    // This is used to show the typing indicator
    let isAITyping = false;

    // Send a message to the AI and handle the response
    async function sendMessage(e, user) {
        // Prevent the default form submission behavior
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        if (!message) return;

        const uid = user.uid;
        const chatRef = firebase.database().ref('chats/' + uid);

        // Append the user's message to the chat in Firebase
        const userMsg = {
            sender: 'You',
            message: message,
            timestamp: Date.now()
        };
        await chatRef.push(userMsg);

        // Append the user's message to the chat UI
        appendMessage('You', message);
        userInput.value = '';

        isAITyping = true;
        const typingIndicator = showTypingIndicator();

        // Send the message to server.js to the AI and get the response
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                userId: uid
            })
        });

        const data = await res.json();
        const reply = data.reply || '[No response]';

        const aiMsg = {
            sender: 'AI',
            message: reply,
            timestamp: Date.now()
        };
        await chatRef.push(aiMsg);
        appendMessage('AI', reply);
        removeTypingIndicator(typingIndicator);
    }

    // Format and append a message to the chat container
    function appendMessage(sender, message) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'You' ? 'message user-message' : 'message ai-message';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        contentDiv.innerHTML += `<div class="message-sender">${sender}</div>`;

        if (sender === 'You') {
            contentDiv.innerHTML += `<p>${message}</p>`;
        } else {
            const parsed = marked.parse(message);
            const clean = DOMPurify.sanitize(parsed);
            contentDiv.innerHTML += clean;
        }

        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Show a typing indicator while the AI is generating a response
    // as a placeholder for the AI's actual response
    function showTypingIndicator() {
        const chatContainer = document.getElementById('chatContainer');
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'message ai-message';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<div class="message-sender">AI</div>
            <div class="typing">
                <span class="typing-dots">
                <span style = "margin-right: 5px;"><i class="fa-solid fa-circle"></i></span><span style = "margin-right: 5px;"><i class="fa-solid fa-circle"></i></span><span><i class="fa-solid fa-circle"></i></span>
            </span>
        </div>
        `;

        typingElement.appendChild(contentDiv);
        chatContainer.appendChild(typingElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        return typingElement;
    }

    // Remove the typing indicator once the AI's response is received
    function removeTypingIndicator(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
});