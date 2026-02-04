// ca2 frontend - register form handling and real-time validation

function initRegisterForm() {
  var form = document.getElementById('register-form');
  if (!form) return;

  initRegisterValidation();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    clearAllFieldErrors();

    var username = document.getElementById('username').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    var hasError = false;

    if (!username) {
      showFieldError('username', 'Username is required');
      hasError = true;
    } else if (!isValidUsername(username)) {
      showFieldError('username', 'Username must be 3-20 characters, letters, numbers, underscores only');
      hasError = true;
    }

    if (!email) {
      showFieldError('email', 'Email is required');
      hasError = true;
    } else if (!isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address');
      hasError = true;
    }

    if (!password) {
      showFieldError('password', 'Password is required');
      hasError = true;
    } else {
      var pwResult = validatePassword(password);
      if (!pwResult.valid) {
        showFieldError('password', 'Password needs: ' + pwResult.errors.join(', '));
        hasError = true;
      }
    }

    if (hasError) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    fetch(API_BASE + '/auth/register', authHeaders({ username: username, email: email, password: password }))
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showSuccess('message', 'Registration successful! Redirecting to login...');
            setTimeout(function () {
              window.location.href = 'login.html';
            }, 1500);
          } else {
            showError('message', data.error || 'Registration failed.');
            btn.disabled = false;
            btn.textContent = 'Register';
          }
        });
      })
      .catch(function () {
        showError('message', 'Network error. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Register';
      });
  });
}
