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
    // Not logged in
    const isPublicPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    if (!isPublicPage) {
      window.location.href = 'login.html';
    }
  }
};

const setupNavbar = () => {
  const logoutBtn = document.getElementById('logout-btn');
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
  
  const profileLink = document.getElementById('nav-profile-link');
  if (profileLink && currentUser) {
    profileLink.href = `profile.html?username=${currentUser.username}`;
  }
};

const init = async () => {
  await checkAuth();
  if (currentUser) {
    setupNavbar();
    // Dispatch custom event to let other scripts know user is loaded
    window.dispatchEvent(new Event('userLoaded'));
  }
};

document.addEventListener('DOMContentLoaded', init);
