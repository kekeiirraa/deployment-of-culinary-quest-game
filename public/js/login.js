// ca2 frontend - login form handling
// when user submits login form we send username/email and password to backend and save jwt if success

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  // listen for form submit (user clicks "Log in")
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    clearAllFieldErrors();

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    let hasError = false;

    // client-side check: must have username/email and password
    if (!identifier) {
      showFieldError('identifier', 'Please enter your username or email');
      hasError = true;
    }
    if (!password) {
      showFieldError('password', 'Please enter your password');
      hasError = true;
    }
    if (hasError) return;

    // disable button so user cannot double-submit
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    // send login request to backend; backend returns jwt if password matches
    fetch(API_BASE + '/auth/login', authHeaders({ identifier: identifier, password: password }))
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            setToken(data.token);
            showSuccess('message', 'Login successful! Redirecting...');
            setTimeout(function () {
              window.location.href = 'dashboard.html';
            }, 1000);
          } else {
            showError('message', data.error || 'Login failed.');
            btn.disabled = false;
            btn.textContent = 'Log in';
          }
        });
      })
      .catch(function () {
        showError('message', 'Network error. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Log in';
      });
  });
}
