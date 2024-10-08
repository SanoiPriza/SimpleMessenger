document.addEventListener('DOMContentLoaded', () => {
    function showMessage(message) {
        alert(message);
    }

    const messageInput = document.getElementById('message-input');
    const sendMessageButton = document.getElementById('send-message');
    const messagesDiv = document.getElementById('messages');
    const currentRoomNameElement = document.getElementById('current-room-name');
    const usersList = document.getElementById('users-list');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const roomName = localStorage.getItem('roomName');

    if (!userId || !username ) {
            window.location.href = '/';
            return;
        }

    if (!roomName) {
        window.location.href = '/chatroom';
        return;
    }

    currentRoomNameElement.textContent = `Current Room: ${roomName}`;

    const socket = new WebSocket('ws://localhost:8080/ws/chat');

    socket.onmessage = (event) => {
        const chatMessage = JSON.parse(event.data);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (chatMessage.userId === userId) {
            messageElement.classList.add('my-message');
        } else {
            messageElement.classList.add('other-message');
        }
        const timestamp = new Date(chatMessage.timestamp);
        messageElement.innerHTML = `<strong>${chatMessage.username}</strong>: ${chatMessage.message} <span class="timestamp">${timestamp.toLocaleTimeString()}</span>`;
        messagesDiv.appendChild(messageElement);
        scrollToBottom();
    };

    function triggerSendMessage() {
            const message = messageInput.value;
            if (message) {
                const chatMessage = {
                    userId: userId,
                    username: username,
                    roomId: roomName,
                    message: message,
                    timestamp: new Date().toISOString()
                };

                socket.send(JSON.stringify(chatMessage));

                const params = new URLSearchParams({
                    roomId: roomName,
                    userId: userId,
                    username: username,
                    message: message,
                    timestamp: chatMessage.timestamp
                });

                fetch(`/api/chatrooms/send?${params.toString()}`, {
                    method: 'POST'
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }
                    messageInput.value = '';
                }).catch(error => {
                    showMessage('Error sending message: ' + error.message);
                });
            }
        }

        if (sendMessageButton) {
            sendMessageButton.addEventListener('click', triggerSendMessage);
            messageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    triggerSendMessage();
                }
            });
        }

    function updateUsersList() {
        fetch(`/api/chatrooms/users?roomName=${roomName}`, {
            method: 'GET'
        }).then(response => response.json())
          .then(data => {
              usersList.innerHTML = '';
              data.forEach(user => {
                  const listItem = document.createElement('li');
                  listItem.textContent = user.username;
                  usersList.appendChild(listItem);
              });
          }).catch(error => {
              showMessage('Error fetching users: ' + error.message);
          });
    }

    function loadLast10Messages() {
        fetch(`/api/chatrooms/last10messages?roomName=${roomName}`, {
            method: 'GET'
        }).then(response => response.json())
          .then(data => {
              messagesDiv.innerHTML = '';
              data.forEach(chatMessage => {
                  const messageElement = document.createElement('div');
                  messageElement.classList.add('message');
                  if (chatMessage.userId === userId) {
                      messageElement.classList.add('my-message');
                  } else {
                      messageElement.classList.add('other-message');
                  }
                  const timestamp = new Date(chatMessage.timestamp);
                  messageElement.innerHTML = `<strong>${chatMessage.username}</strong>: ${chatMessage.message} <span class="timestamp">${timestamp.toLocaleTimeString()}</span>`;
                  messagesDiv.appendChild(messageElement);
                  scrollToBottom();
              });
          }).catch(error => {
              showMessage('Error fetching messages: ' + error.message);
          });
    }

    function scrollToBottom() {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

    updateUsersList();
    loadLast10Messages();
});