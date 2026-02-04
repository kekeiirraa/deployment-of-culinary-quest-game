// ca2 frontend - login form handling

function initLoginForm() {
  var form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    clearAllFieldErrors();

    var identifier = document.getElementById('identifier').value.trim();
    var password = document.getElementById('password').value;

    var hasError = false;

    if (!identifier) {
      showFieldError('identifier', 'Please enter your username or email');
      hasError = true;
    }

    if (!password) {
      showFieldError('password', 'Please enter your password');
      hasError = true;
    }

    if (hasError) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

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
