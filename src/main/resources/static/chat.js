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

    if (!userId || !username) {
        showMessage('User ID or username is missing. Please log in again.');
        return;
    }

    if (!roomName) {
        showMessage('Room name is not set. Please join a room first.');
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
    };

    if (sendMessageButton) {
        sendMessageButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message) {
                const chatMessage = {
                    userId: userId,
                    username: username,
                    roomId: roomName,
                    message: message,
                    timestamp: Date.now()
                };
                socket.send(JSON.stringify(chatMessage));
                messageInput.value = '';
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
              data.reverse().forEach(chatMessage => {
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
              });
          }).catch(error => {
              showMessage('Error fetching messages: ' + error.message);
          });
    }

    updateUsersList();
    loadLast10Messages();
});