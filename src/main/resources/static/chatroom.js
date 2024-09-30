document.addEventListener('DOMContentLoaded', () => {
    const createRoomButton = document.getElementById('create-room');
    const joinRoomButton = document.getElementById('join-room');
    const leaveRoomButton = document.getElementById('leave-room');
    const roomIdInput = document.getElementById('room-id');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID is missing');
        alert('User ID is missing. Please log in again.');
        return;
    }

    if (createRoomButton) {
        createRoomButton.addEventListener('click', () => {
            const roomName = roomIdInput.value;

            fetch(`/api/chatrooms/exists?name=${roomName}`, {
                method: 'GET'
            }).then(response => response.json())
              .then(data => {
                  if (data) {
                      console.error('Chat room already exists');
                      alert('Chat room with this name already exists. Please choose a different name.');
                  } else {
                      fetch('/api/chatrooms/create', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ name: roomName })
                      }).then(response => {
                          if (!response.ok) {
                              return response.json().then(err => { throw new Error(err.message); });
                          }
                          return response.json();
                      }).then(data => {
                          console.log('Chat room created:', data);
                          roomIdInput.value = data.id;
                          localStorage.setItem('roomName', roomName);
                      }).catch(error => {
                          console.error('Error:', error.message);
                          alert('Error creating chat room: ' + error.message);
                      });
                  }
              });
        });
    }

    if (joinRoomButton) {
        joinRoomButton.addEventListener('click', () => {
            const roomName = roomIdInput.value;

            console.log('Join button clicked');
            console.log('Room Name:', roomName);
            console.log('User ID:', userId);

            fetch(`/api/chatrooms/join?name=${roomName}&userId=${userId}`, {
                method: 'POST'
            }).then(response => {
                console.log('Response status:', response.status);
                return response.json();
            }).then(data => {
                console.log('Response data:', data);
                if (data.error) {
                    throw new Error(data.error);
                }
                console.log('Joined chat room:', data);
                localStorage.setItem('roomName', roomName);
                window.location.href = '/chat';
            }).catch(error => {
                console.error('Error:', error);
                alert('Error joining chat room: ' + error.message);
            });
        });
    }

    if (leaveRoomButton) {
        leaveRoomButton.addEventListener('click', () => {
            const roomName = roomIdInput.value;

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