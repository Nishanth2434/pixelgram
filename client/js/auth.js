document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const errorMsg = document.getElementById('error-msg');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        await window.api.login(email, password);
        window.location.href = 'index.html';
      } catch (err) {
        errorMsg.textContent = err.message;
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const fullName = document.getElementById('fullName').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        await window.api.signup(username, email, password, fullName);
        window.location.href = 'index.html';
      } catch (err) {
        errorMsg.textContent = err.message;
      }
    });
  }
});
