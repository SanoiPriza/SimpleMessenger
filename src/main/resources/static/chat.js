document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendMessageButton = document.getElementById('send-message');
    const leaveRoomButton = document.getElementById('leave-room');
    const messagesDiv = document.getElementById('messages');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const roomName = localStorage.getItem('roomName');

    if (!userId || !username) {
        console.error('User ID or username is missing');
        alert('User ID or username is missing. Please log in again.');
        return;
    }

    if (!roomName) {
        console.error('Room name is not set');
        alert('Room name is not set. Please join a room first.');
        return;
    }

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

    if (leaveRoomButton) {
        leaveRoomButton.addEventListener('click', () => {
            fetch(`/api/chatrooms/leave?name=${roomName}&userId=${userId}`, {
                method: 'POST'
            }).then(response => response.json())
              .then(data => {
                  console.log('Left chat room:', data);
                  window.location.href = '/chatroom';
              });
        });
    }
});