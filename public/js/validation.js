// ca2 frontend - client-side validation (instant feedback in ui)
// no regex - simple string checks

// validates email format: must contain @ and something after it
function isValidEmail(email) {
  const atIndex = email.indexOf('@');
  if (atIndex < 1) return false;
  if (atIndex >= email.length - 1) return false;
  return true;
}

// validates username: 3-20 chars, only letters, numbers, underscore
function isValidUsername(username) {
  if (username.length < 3 || username.length > 20) return false;
  for (let i = 0; i < username.length; i++) {
    const c = username[i];
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_') {
      continue;
    }
    return false;
  }
  return true;
}

// validates password strength and returns detailed result (no regex)
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  let hasUpper = false;
  let hasLower = false;
  let hasNumber = false;
  let hasSpecial = false;
  const specialChars = '!@#$%^&*(),.?":{}|<>';
  for (let i = 0; i < password.length; i++) {
    const c = password[i];
    if (c >= 'A' && c <= 'Z') hasUpper = true;
    if (c >= 'a' && c <= 'z') hasLower = true;
    if (c >= '0' && c <= '9') hasNumber = true;
    if (specialChars.indexOf(c) !== -1) hasSpecial = true;
  }
  if (!hasUpper) errors.push('one uppercase letter');
  if (!hasLower) errors.push('one lowercase letter');
  if (!hasNumber) errors.push('one number');
  if (!hasSpecial) errors.push('one special character');
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// updates password strength indicator
function updatePasswordStrength(password) {
  const indicator = document.getElementById('password-strength');
  if (!indicator) return;

  const result = validatePassword(password);
  const strength = 5 - result.errors.length;

  indicator.classList.remove('hidden');
  indicator.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const bar = document.createElement('span');
    bar.className = 'strength-bar';
    if (i < strength) {
      if (strength <= 2) bar.classList.add('weak');
      else if (strength <= 4) bar.classList.add('medium');
      else bar.classList.add('strong');
    }
    indicator.appendChild(bar);
  }

  const label = document.createElement('span');
  label.className = 'strength-label';
  if (strength <= 2) label.textContent = 'Weak';
  else if (strength <= 4) label.textContent = 'Medium';
  else label.textContent = 'Strong';
  indicator.appendChild(label);
}

// real-time validation for register form
function initRegisterValidation() {
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (usernameInput) {
    usernameInput.addEventListener('blur', function () {
      const val = usernameInput.value.trim();
      if (val && !isValidUsername(val)) {
        showFieldError('username', 'Username must be 3-20 characters, letters, numbers, underscores only');
      } else {
        hideFieldError('username');
      }
    });
    usernameInput.addEventListener('input', function () {
      hideFieldError('username');
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      const val = emailInput.value.trim();
      if (val && !isValidEmail(val)) {
        showFieldError('email', 'Please enter a valid email address');
      } else {
        hideFieldError('email');
      }
    });
    emailInput.addEventListener('input', function () {
      hideFieldError('email');
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      updatePasswordStrength(passwordInput.value);
    });
    passwordInput.addEventListener('blur', function () {
      const result = validatePassword(passwordInput.value);
      if (passwordInput.value && !result.valid) {
        showFieldError('password', 'Password needs: ' + result.errors.join(', '));
      } else {
        hideFieldError('password');
      }
    });
  }
}
