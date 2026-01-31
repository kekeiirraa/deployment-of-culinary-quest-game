// ca2 frontend - auth helpers and form handling
// stores jwt in localStorage and sends it in api requests

const API_BASE = '';

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

// fetch options with json body and optional auth header
function authHeaders(body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return {
    method: body ? 'POST' : 'GET',
    headers,
    ...(body && { body: JSON.stringify(body) })
  };
}

// show error message in element with id "message"
function showError(elId, text) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = 'message error';
  el.classList.remove('hidden');
}

// show success message
function showSuccess(elId, text) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = 'message success';
  el.classList.remove('hidden');
}

// hide message element
function hideMessage(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.add('hidden');
}

// handle login form submit - post to /auth/login, store token, redirect to index
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) {
      showError('message', 'Please enter username and password.');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    fetch(API_BASE + '/auth/login', authHeaders({ username, password }))
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            setToken(data.token);
            window.location.href = 'index.html';
          } else {
            showError('message', data.error || 'Login failed.');
            btn.disabled = false;
          }
        });
      })
      .catch(function () {
        showError('message', 'Network error. Please try again.');
        btn.disabled = false;
      });
  });
}

// handle register form submit - post to /auth/register, then redirect to login
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) {
      showError('message', 'Please enter username and password.');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    fetch(API_BASE + '/auth/register', authHeaders({ username, password }))
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showSuccess('message', 'Registration successful. Redirecting to login...');
            setTimeout(function () {
              window.location.href = 'login.html';
            }, 1500);
          } else {
            showError('message', data.error || 'Registration failed.');
            btn.disabled = false;
          }
        });
      })
      .catch(function () {
        showError('message', 'Network error. Please try again.');
        btn.disabled = false;
      });
  });
}

// on index: show logged-in state if token exists, else show login/register links
function initIndex() {
  const token = getToken();
  const guestSection = document.getElementById('guest-section');
  const loggedSection = document.getElementById('logged-section');
  if (token && loggedSection) {
    if (guestSection) guestSection.classList.add('hidden');
    loggedSection.classList.remove('hidden');
  } else if (guestSection) {
    guestSection.classList.remove('hidden');
    if (loggedSection) loggedSection.classList.add('hidden');
  }
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      clearToken();
      window.location.href = 'index.html';
    });
  }
}
