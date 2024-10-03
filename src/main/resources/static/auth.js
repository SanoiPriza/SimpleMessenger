document.addEventListener('DOMContentLoaded', () => {
    function showMessage(message) {
        alert(message);
    }

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const registerButton = document.getElementById('register');
    const loginButton = document.getElementById('login');

    function triggerLogin() {
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
        }

    function triggerRegister() {
            const username = usernameInput.value;
            const password = passwordInput.value;
            const email = emailInput.value;

            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email })
            }).then(response => {
                if (response.status === 400) {
                    showMessage('All fields are required.');
                    return null;
                }
                return response.json();
            }).then(data => {
                if (data && data.id) {
                    localStorage.setItem('userId', data.id);
                    localStorage.setItem('username', data.username);
                    window.location.href = '/chatroom';
                } else {
                    showMessage('Registration failed');
                }
            }).catch(error => {
                showMessage('Error during registration: ' + error.message);
            });
        }

    if (registerButton) {
            registerButton.addEventListener('click', triggerRegister);
            usernameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    triggerRegister();
                }
            });
            passwordInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    triggerRegister();
                }
            });
            emailInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    triggerRegister();
                }
            });
        }

    if (loginButton) {
            loginButton.addEventListener('click', triggerLogin);
            usernameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    triggerLogin();
                }
            });
            passwordInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    triggerLogin();
                }
            });
        }
    });