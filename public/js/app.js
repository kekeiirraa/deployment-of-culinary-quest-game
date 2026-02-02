// ca2 frontend - auth helpers, form handling, and validation
// stores jwt in localStorage and sends it in api requests

const API_BASE = '';

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
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return {
    method: method || (body ? 'POST' : 'GET'),
    headers,
    ...(body && { body: JSON.stringify(body) })
  };
}

// ========================================
// message display helpers
// ========================================

// show error message in element (pass the id of the element)
function showError(id, text) {
  var msgBox = document.getElementById(id);
  if (msgBox === null) return;
  msgBox.textContent = text;
  msgBox.className = 'message error';
  msgBox.classList.remove('hidden');
}

// show success message
function showSuccess(id, text) {
  var msgBox = document.getElementById(id);
  if (msgBox === null) return;
  msgBox.textContent = text;
  msgBox.className = 'message success';
  msgBox.classList.remove('hidden');
}

// hide message element
function hideMessage(id) {
  var msgBox = document.getElementById(id);
  if (msgBox !== null) msgBox.classList.add('hidden');
}

// show field-level error
function showFieldError(fieldId, text) {
  var errBox = document.getElementById(fieldId + '-error');
  if (errBox !== null) {
    errBox.textContent = text;
    errBox.classList.remove('hidden');
  }
  var inputBox = document.getElementById(fieldId);
  if (inputBox !== null) inputBox.classList.add('input-error');
}

// hide field-level error
function hideFieldError(fieldId) {
  var errBox = document.getElementById(fieldId + '-error');
  if (errBox !== null) errBox.classList.add('hidden');
  var inputBox = document.getElementById(fieldId);
  if (inputBox !== null) inputBox.classList.remove('input-error');
}

// clear all field errors
function clearAllFieldErrors() {
  var allErrors = document.querySelectorAll('.field-error');
  for (var i = 0; i < allErrors.length; i++) {
    allErrors[i].classList.add('hidden');
  }
  var allInputs = document.querySelectorAll('.input-error');
  for (var j = 0; j < allInputs.length; j++) {
    allInputs[j].classList.remove('input-error');
  }
}

// ========================================
// client-side validation functions
// ========================================

// validates email format: must contain @ and something after it
function isValidEmail(email) {
  var atIndex = email.indexOf('@');
  if (atIndex < 1) return false;
  if (atIndex >= email.length - 1) return false;
  return true;
}

// validates username: 3-20 chars, only letters, numbers, underscore
function isValidUsername(username) {
  if (username.length < 3 || username.length > 20) return false;
  for (var i = 0; i < username.length; i++) {
    var c = username[i];
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_') {
      continue;
    }
    return false;
  }
  return true;
}

// validates password strength and returns detailed result (no regex)
function validatePassword(password) {
  var errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  var hasUpper = false;
  var hasLower = false;
  var hasNumber = false;
  var hasSpecial = false;
  var specialChars = '!@#$%^&*(),.?":{}|<>';
  for (var i = 0; i < password.length; i++) {
    var c = password[i];
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

// ========================================
// real-time validation for register form
// ========================================

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

// ========================================
// login form handling
// ========================================

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    clearAllFieldErrors();

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    // client-side validation
    let hasError = false;

    if (!identifier) {
      showFieldError('identifier', 'Please enter your username or email');
      hasError = true;
    }

    if (!password) {
      showFieldError('password', 'Please enter your password');
      hasError = true;
    }

    if (hasError) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    fetch(API_BASE + '/auth/login', authHeaders({ identifier, password }))
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

// ========================================
// register form handling
// ========================================

function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  // initialize real-time validation
  initRegisterValidation();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    clearAllFieldErrors();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // client-side validation
    let hasError = false;

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
      const pwResult = validatePassword(password);
      if (!pwResult.valid) {
        showFieldError('password', 'Password needs: ' + pwResult.errors.join(', '));
        hasError = true;
      }
    }

    if (hasError) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    fetch(API_BASE + '/auth/register', authHeaders({ username, email, password }))
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

// ========================================
// index page
// ========================================

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

// ========================================
// dashboard page - fetch and dom manipulation
// ========================================

function initDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  loadUserProfile();
  loadLeaderboard();
  initLogout();
}

// fetch user profile and display using dom
function loadUserProfile() {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;

  // decode user id from token payload
  const token = getToken();
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.userId;

  fetch(API_BASE + '/games/profile/' + userId, authHeaders())
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.error) {
        profileContainer.innerHTML = '<p class="error">Failed to load profile</p>';
        return;
      }

      // dom manipulation to display profile
      profileContainer.innerHTML = '';

      var nameBox = document.createElement('h2');
      nameBox.textContent = 'Welcome, ' + data.username + '!';
      profileContainer.appendChild(nameBox);

      var rankBox = document.createElement('p');
      rankBox.className = 'rank-badge';
      rankBox.textContent = data.rank;
      profileContainer.appendChild(rankBox);

      var statsBox = document.createElement('div');
      statsBox.className = 'stats-grid';
      statsBox.innerHTML =
        '<div class="stat-item"><span class="stat-value">' + data.points + '</span><span class="stat-label">Points</span></div>' +
        '<div class="stat-item"><span class="stat-value">' + (data.challenges_completed || 0) + '</span><span class="stat-label">Challenges</span></div>';
      profileContainer.appendChild(statsBox);

      if (data.next_rank) {
        var nextBox = document.createElement('p');
        nextBox.className = 'next-rank';
        nextBox.textContent = 'Next: ' + data.next_rank;
        profileContainer.appendChild(nextBox);
      }
    })
    .catch(function () {
      profileContainer.innerHTML = '<p class="error">Network error loading profile</p>';
    });
}

// fetch and display leaderboard
function loadLeaderboard() {
  const leaderboardContainer = document.getElementById('leaderboard-container');
  if (!leaderboardContainer) return;

  fetch(API_BASE + '/games/leaderboard', authHeaders())
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data.leaderboard) {
        leaderboardContainer.innerHTML = '<p>No leaderboard data</p>';
        return;
      }

      // dom manipulation to create leaderboard
      leaderboardContainer.innerHTML = '<h3>Top Chefs</h3>';

      const list = document.createElement('ol');
      list.className = 'leaderboard-list';

      data.leaderboard.forEach(function (user, index) {
        var item = document.createElement('li');
        item.className = 'leaderboard-item';
        if (index < 3) item.classList.add('top-' + (index + 1));

        var nameSpan = document.createElement('span');
        nameSpan.className = 'lb-name';
        if (index === 0) nameSpan.innerHTML = '&#129351; ' + user.username;
        else if (index === 1) nameSpan.innerHTML = '&#129352; ' + user.username;
        else if (index === 2) nameSpan.innerHTML = '&#129353; ' + user.username;
        else nameSpan.textContent = user.username;

        var pointsSpan = document.createElement('span');
        pointsSpan.className = 'lb-points';
        pointsSpan.textContent = user.points + ' pts';

        item.appendChild(nameSpan);
        item.appendChild(pointsSpan);
        list.appendChild(item);
      });

      leaderboardContainer.appendChild(list);
    })
    .catch(function () {
      leaderboardContainer.innerHTML = '<p class="error">Failed to load leaderboard</p>';
    });
}

// ========================================
// challenges page - fetch and dom manipulation
// ========================================

function initChallenges() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  loadChallenges();
  initLogout();
}

// fetch and display all challenges
function loadChallenges() {
  const container = document.getElementById('challenges-container');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading challenges...</p>';

  fetch(API_BASE + '/challenges', authHeaders())
    .then(function (res) {
      return res.json();
    })
    .then(function (challenges) {
      if (!Array.isArray(challenges) || challenges.length === 0) {
        container.innerHTML = '<p>No challenges available yet.</p>';
        return;
      }

      // dom manipulation to create challenge cards
      container.innerHTML = '';

      challenges.forEach(function (challenge) {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.dataset.id = challenge.challenge_id;

        const desc = document.createElement('p');
        desc.className = 'challenge-desc';
        desc.textContent = challenge.challenge || challenge.description;

        const points = document.createElement('span');
        points.className = 'challenge-points';
        points.textContent = '+' + challenge.points + ' pts';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn-complete';
        completeBtn.textContent = 'Complete Challenge';
        completeBtn.addEventListener('click', function () {
          completeChallenge(challenge.challenge_id, card);
        });

        card.appendChild(desc);
        card.appendChild(points);
        card.appendChild(completeBtn);
        container.appendChild(card);
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load challenges</p>';
    });
}

// complete a challenge via api
function completeChallenge(challengeId, cardEl) {
  const token = getToken();
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.userId;

  const btn = cardEl.querySelector('.btn-complete');
  btn.disabled = true;
  btn.textContent = 'Completing...';

  fetch(API_BASE + '/challenges/' + challengeId + '/completions', authHeaders({ user_id: userId, details: 'Completed via web app' }))
    .then(function (res) {
      return res.json().then(function (data) {
        if (res.ok) {
          btn.textContent = 'Completed!';
          btn.classList.add('completed');
          cardEl.classList.add('challenge-completed');

          // show success feedback
          const feedback = document.createElement('p');
          feedback.className = 'completion-feedback';
          feedback.textContent = 'Great job! Points added to your profile.';
          cardEl.appendChild(feedback);
        } else {
          btn.textContent = 'Complete Challenge';
          btn.disabled = false;
          alert(data.error || 'Failed to complete challenge');
        }
      });
    })
    .catch(function () {
      btn.textContent = 'Complete Challenge';
      btn.disabled = false;
      alert('Network error. Please try again.');
    });
}

// ========================================
// protected page check
// ========================================

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// extract user id from token
function getUserIdFromToken() {
  const token = getToken();
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.userId;
}

// ========================================
// progress page - track user's completed challenges
// ========================================

function initProgress() {
  if (!requireAuth()) return;
  const userId = getUserIdFromToken();
  loadProgressSummary(userId);
  loadCompletedChallenges(userId);
  initLogout();
}

// fetch and display progress summary
function loadProgressSummary(userId) {
  const container = document.getElementById('summary-content');
  if (!container) return;

  fetch(API_BASE + '/games/profile/' + userId, authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.error) {
        container.innerHTML = '<p class="error">Failed to load summary</p>';
        return;
      }
      container.innerHTML =
        '<div class="summary-grid">' +
        '<div class="summary-item"><strong>' + data.points + '</strong><span>Total Points</span></div>' +
        '<div class="summary-item"><strong>' + data.challenges_completed + '</strong><span>Challenges Completed</span></div>' +
        '<div class="summary-item"><strong>' + data.rank + '</strong><span>Current Rank</span></div>' +
        '</div>' +
        '<p class="next-goal">' + data.next_rank + '</p>';
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load summary</p>';
    });
}

// fetch and display user's completed challenges
function loadCompletedChallenges(userId) {
  const container = document.getElementById('completed-challenges-container');
  if (!container) return;

  fetch(API_BASE + '/games/user/' + userId + '/challenges', authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (challenges) {
      if (!Array.isArray(challenges) || challenges.length === 0) {
        container.innerHTML = '<p class="empty-state">No completed challenges yet. <a href="challenges.html">Start a challenge now!</a></p>';
        return;
      }
      container.innerHTML = '<div class="completed-list"></div>';
      const list = container.querySelector('.completed-list');
      challenges.forEach(function (c) {
        const item = document.createElement('div');
        item.className = 'completed-item';
        const date = new Date(c.completed_at).toLocaleDateString();
        item.innerHTML =
          '<div class="completed-desc">' + c.challenge + '</div>' +
          '<div class="completed-meta">' +
          '<span class="completed-points">+' + c.points + ' pts</span>' +
          '<span class="completed-date">' + date + '</span>' +
          '</div>';
        list.appendChild(item);
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load challenges</p>';
    });
}

// ========================================
// create challenge page
// ========================================

function initCreateChallenge() {
  if (!requireAuth()) return;
  initLogout();

  const form = document.getElementById('create-challenge-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideMessage('message');
    clearAllFieldErrors();

    const description = document.getElementById('description').value.trim();
    const points = parseInt(document.getElementById('points').value);
    const userId = getUserIdFromToken();

    let hasError = false;

    if (!description || description.length < 10) {
      showFieldError('description', 'Description must be at least 10 characters');
      hasError = true;
    }

    if (!points || points < 1 || points > 100) {
      showFieldError('points', 'Points must be between 1 and 100');
      hasError = true;
    }

    if (hasError) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    fetch(API_BASE + '/challenges', authHeaders({ description, points, user_id: userId }))
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.ok) {
            showSuccess('message', 'Challenge created successfully!');
            form.reset();
            setTimeout(function () {
              window.location.href = 'challenges.html';
            }, 1500);
          } else {
            showError('message', data.error || 'Failed to create challenge');
            btn.disabled = false;
            btn.textContent = 'Create Challenge';
          }
        });
      })
      .catch(function () {
        showError('message', 'Network error. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Create Challenge';
      });
  });
}

// ========================================
// badges page
// ========================================

function initBadges() {
  if (!requireAuth()) return;
  const userId = getUserIdFromToken();
  loadEarnedBadges(userId);
  loadAllBadges(userId);
  initLogout();
}

// fetch and display user's earned badges
function loadEarnedBadges(userId) {
  var container = document.getElementById('earned-badges-container');
  var countBox = document.getElementById('earned-count');
  if (!container) return;

  fetch(API_BASE + '/games/user/' + userId + '/badges', authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (badges) {
      if (!Array.isArray(badges) || badges.length === 0) {
        container.innerHTML = '<p class="empty-state">No badges earned yet. Complete challenges to earn badges!</p>';
        if (countBox) countBox.textContent = '0';
        return;
      }
      if (countBox) countBox.textContent = badges.length;
      container.innerHTML = '';
      badges.forEach(function (badge) {
        const card = createBadgeCard(badge, true);
        container.appendChild(card);
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load badges</p>';
    });
}

// fetch and display all available badges
function loadAllBadges(userId) {
  const container = document.getElementById('all-badges-container');
  if (!container) return;

  fetch(API_BASE + '/games/badges', authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (badges) {
      if (!Array.isArray(badges) || badges.length === 0) {
        container.innerHTML = '<p>No badges available</p>';
        return;
      }
      container.innerHTML = '';
      badges.forEach(function (badge) {
        const card = createBadgeCard(badge, false);
        container.appendChild(card);
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load badges</p>';
    });
}

// create badge card element using dom manipulation
// lock icon 128274, first place medal 129351 (w3schools style)
function createBadgeCard(badge, earned) {
  var card = document.createElement('div');
  card.className = 'badge-card' + (earned ? ' badge-earned' : '');

  var icon = document.createElement('div');
  icon.className = 'badge-icon';
  icon.innerHTML = earned ? '&#129351;' : '&#128274;';

  var name = document.createElement('h4');
  name.className = 'badge-name';
  name.textContent = badge.badge_name;

  var desc = document.createElement('p');
  desc.className = 'badge-desc';
  desc.textContent = badge.description;

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(desc);

  if (earned && badge.earned_date) {
    var date = document.createElement('p');
    date.className = 'badge-date';
    date.textContent = 'Earned: ' + new Date(badge.earned_date).toLocaleDateString();
    card.appendChild(date);
  }

  return card;
}

