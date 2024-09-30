document.addEventListener('DOMContentLoaded', () => {
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
                  console.log('User registered:', data);
                  localStorage.setItem('username', data.username);
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
                      console.log('User logged in:', data);
                      localStorage.setItem('userId', data.id);
                      localStorage.setItem('username', data.username);
                      displayUserInfo(data);
                      window.location.href = '/chatroom';
                  } else {
                      console.error('Login failed');
                  }
              }).catch(error => {
                  console.error('Error during login:', error);
              });
        });
    }

    function displayUserInfo(user) {
        if (userDetailsP) {
            userDetailsP.textContent = `Username: ${user.username}, Email: ${user.email}`;
            userInfoDiv.style.display = 'block';
        } else {
            console.error('User details element not found');
        }
    }
});