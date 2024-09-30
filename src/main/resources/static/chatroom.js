document.addEventListener('DOMContentLoaded', () => {
    function showMessage(message) {
        alert(message);
    }

    const createRoomButton = document.getElementById('create-room');
    const joinRoomButton = document.getElementById('join-room');
    const roomIdInput = document.getElementById('room-id');
    const roomsList = document.getElementById('rooms-list');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const userDetailsP = document.getElementById('user-details');

    if (!userId || !username) {
        window.location.href = '/';
        return;
    }

    if (userDetailsP) {
        userDetailsP.textContent = `${username}`;
    }

    function updateJoinedRooms() {
        fetch(`/api/chatrooms/joined?userId=${userId}`, {
            method: 'GET'
        }).then(response => response.json())
          .then(data => {
              roomsList.innerHTML = '';
              data.forEach(room => {
                  const listItem = document.createElement('li');
                  listItem.textContent = room.name;
                  const enterButton = document.createElement('button');
                  enterButton.textContent = 'Enter';
                  enterButton.addEventListener('click', () => {
                      localStorage.setItem('roomName', room.name);
                      window.location.href = '/chat';
                  });
                  const leaveButton = document.createElement('button');
                  leaveButton.textContent = 'Leave';
                  leaveButton.addEventListener('click', () => {
                      fetch(`/api/chatrooms/leave?name=${room.name}&userId=${userId}`, {
                          method: 'POST'
                      }).then(response => response.json())
                        .then(data => {
                            showMessage('Left chat room');
                            updateJoinedRooms();
                        }).catch(error => {
                            showMessage('Error leaving chat room: ' + error.message);
                        });
                  });
                  listItem.appendChild(enterButton);
                  listItem.appendChild(leaveButton);
                  roomsList.appendChild(listItem);
              });
          }).catch(error => {
              showMessage('Error fetching joined rooms: ' + error.message);
          });
    }

    updateJoinedRooms();

    if (createRoomButton) {
        createRoomButton.addEventListener('click', () => {
            const roomName = roomIdInput.value;

            fetch(`/api/chatrooms/exists?name=${roomName}`, {
                method: 'GET'
            }).then(response => response.json())
              .then(data => {
                  if (data) {
                      showMessage('Chat room with this name already exists. Please choose a different name.');
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
                          localStorage.setItem('roomName', roomName);
                          fetch(`/api/chatrooms/join?name=${roomName}&userId=${userId}`, {
                                          method: 'POST'
                                      }).then(response => {
                                          return response.json();
                                      }).then(data => {
                                          if (data.error) {
                                              throw new Error(data.error);
                                          }
                                          localStorage.setItem('roomName', roomName);
                                          updateJoinedRooms();
                                      }).catch(error => {
                                          showMessage('Error joining chat room: ' + error.message);
                                      });
                          updateJoinedRooms();
                      }).catch(error => {
                          showMessage('Error creating chat room: ' + error.message);
                      });
                  }
              }).catch(error => {
                  showMessage('Error checking chat room existence: ' + error.message);
              });
        });
    }

    if (joinRoomButton) {
        joinRoomButton.addEventListener('click', () => {
            const roomName = roomIdInput.value;

            fetch(`/api/chatrooms/join?name=${roomName}&userId=${userId}`, {
                method: 'POST'
            }).then(response => response.json())
              .then(data => {
                  if (data.error) {
                      throw new Error(data.error);
                  }
                  localStorage.setItem('roomName', roomName);
                  showMessage('Joined chat room successfully');
                  updateJoinedRooms();
              }).catch(error => {
                  showMessage('Error joining chat room: ' + error.message);
              });
        });
    }

    updateJoinedRooms();
});