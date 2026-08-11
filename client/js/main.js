let currentUser = null;

const checkAuth = async () => {
  try {
    const res = await window.api.getMe();
    currentUser = res.data;
    
    // Redirect if on login/signup
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
      window.location.href = 'index.html';
    }
  } catch (err) {
    currentUser = null;
    // If not logged in, only redirect if on a protected page
    if (window.location.pathname.includes('edit-profile.html')) {
      window.location.href = 'login.html';
    }
  }
};

const setupNavbar = () => {
  const logoutBtn = document.getElementById('logout-btn');
  const profileLink = document.getElementById('nav-profile-link');
  
  if (currentUser) {
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await window.api.logout();
          window.location.href = 'login.html';
        } catch (err) {
          console.error(err);
        }
      });
    }
    
    if (profileLink) {
      profileLink.href = `profile.html?username=${currentUser.username}`;
    }
  } else {
    if (logoutBtn) {
      logoutBtn.textContent = 'Log In';
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
      });
    }
    if (profileLink) {
      profileLink.href = 'login.html';
    }
  }
};

const init = async () => {
  await checkAuth();
  setupNavbar();
  window.dispatchEvent(new Event('userLoaded'));
};

document.addEventListener('DOMContentLoaded', init);
