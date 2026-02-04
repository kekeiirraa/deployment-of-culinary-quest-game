// ca2 frontend - api base, token management, auth helpers
// jwt is stored in localStorage and sent in api requests

// base path for api calls (empty = same server)
var API_BASE = '';

// ========================================
// token management
// ========================================

// returns stored jwt or null
function getToken() {
  return localStorage.getItem('token');
}

// saves token after login
function setToken(token) {
  localStorage.setItem('token', token);
}

// removes token on logout
function clearToken() {
  localStorage.removeItem('token');
}

// ========================================
// api request helpers
// ========================================

// fetch options with json body and optional auth header
function authHeaders(body, method) {
  var headers = { 'Content-Type': 'application/json' };
  var token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  var opts = {
    method: method || (body ? 'POST' : 'GET'),
    headers: headers
  };
  if (body) opts.body = JSON.stringify(body);
  return opts;
}

// ========================================
// protected page and auth helpers
// ========================================

// if no token, redirect to login and return false; else return true
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// extract user id from token
function getUserIdFromToken() {
  var token = getToken();
  if (!token) return null;
  var payload = JSON.parse(atob(token.split('.')[1]));
  return payload.userId;
}

// when logout button clicked, ask confirm then clear token and go to index
function initLogout() {
  var btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      var confirmLogout = confirm('Are you sure you want to log out?');
      if (confirmLogout === true) {
        clearToken();
        window.location.href = 'index.html';
      }
    });
  }
}
