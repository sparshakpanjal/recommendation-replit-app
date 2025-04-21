
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in on protected pages
  const token = localStorage.getItem('token');
  const isLoginPage = window.location.pathname.includes('login.html');
  const isRegisterPage = window.location.pathname.includes('register.html');
  
  if (!token && !isLoginPage && !isRegisterPage) {
    window.location.href = '/login.html';
  }
  
  // Add logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    });
  }
});
