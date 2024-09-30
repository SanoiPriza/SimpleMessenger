document.addEventListener('DOMContentLoaded', () => {
    function showMessage(message) {
        alert(message);
    }

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const registerButton = document.getElementById('register');
    const loginButton = document.getElementById('login');
    const userInfoDiv = document.getElementById('user-info');
    const userDetailsP = document.getElementById('user-details');

    if (registerButton) {
        registerButton.addEventListener('click', () => {
            const username = usernameInput.value;
            const password = passwordInput.value;
            const email = emailInput.value;

            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email })
            }).then(response => response.json())
              .then(data => {
                  showMessage('User registered successfully');
                  localStorage.setItem('username', data.username);
              }).catch(error => {
                  showMessage('Error during registration: ' + error.message);
              });
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const username = usernameInput.value;
            const password = passwordInput.value;

            fetch(`/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            }).then(response => response.json())
              .then(data => {
                  if (data && data.id) {
                      localStorage.setItem('userId', data.id);
                      localStorage.setItem('username', data.username);
                      window.location.href = '/chatroom';
                  } else {
                      showMessage('Login failed');
                  }
              }).catch(error => {
                  showMessage('Error during login: ' + error.message);
              });
        });
    }

    function displayUserInfo(user) {
        if (userDetailsP) {
            userDetailsP.textContent = `Username: ${user.username}, Email: ${user.email}`;
            userInfoDiv.style.display = 'block';
        }
    }
});