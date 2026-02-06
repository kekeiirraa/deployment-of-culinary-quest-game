// ca2 frontend - api base, token management, auth helpers
// jwt is stored in localStorage and sent in every request header so backend knows who is logged in

// base path for api calls (empty = same server as the frontend)
const API_BASE = '';

// ========================================
// token management
// ========================================

// returns the stored jwt from browser storage, or null if not logged in
function getToken() {
  return localStorage.getItem('token');
}

// saves the jwt after successful login so we stay logged in
function setToken(token) {
  localStorage.setItem('token', token);
}

// removes the jwt when user logs out
function clearToken() {
  localStorage.removeItem('token');
}

// ========================================
// api request helpers
// ========================================

// builds options for fetch: content-type json, and authorization header with jwt if we have one
function authHeaders(body, method) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  const opts = {
    method: method || (body ? 'POST' : 'GET'),
    headers: headers
  };
  if (body) opts.body = JSON.stringify(body);
  return opts;
}

// ========================================
// protected page and auth helpers
// ========================================

// call this on pages that require login; if no token, redirect to login and return false
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// get the user id from the jwt payload (used when we need to send user_id to the api)
function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.userId;
}

// attach click handler to logout button(s): confirm then clear token and go to home page
// works for both top nav and drawer logout buttons (class="logout-btn")
function initLogout() {
  const btns = document.querySelectorAll('.logout-btn');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const confirmLogout = confirm('Are you sure you want to log out?');
      if (confirmLogout === true) {
        clearToken();
        window.location.href = 'index.html';
      }
    });
  });
}
