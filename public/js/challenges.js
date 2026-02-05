// ca2 frontend - kitchen quests page (list, category tabs, complete)

// category keywords for client-side filter (until challenges have category_id)
const CATEGORY_KEYWORDS = {
  prep: ['hydration', 'hydrate', 'water', 'stretch', 'morning', 'breakfast', 'prep', 'organize'],
  market: ['steps', 'walk', 'exercise', 'workout', 'run', 'market', 'ingredients', 'garden'],
  rest: ['sleep', 'rest', 'mental', 'meditation', 'mindfulness', 'zen', 'relax'],
  research: ['read', 'learn', 'book', 'research', 'recipe'],
  seasonal: ['week', 'day', 'marathon', 'special', 'consecutive']
};

let allChallenges = [];

// run when page loads: redirect if no token, load challenges and categories
function initChallenges() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  loadChallenges();
  initCategoryTabs();
  initLogout();
}

// wire category tab clicks
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      renderChallenges(allChallenges, cat);
    });
  });
}

// filter challenges by category (keyword match in description)
function filterByCategory(challenges, category) {
  if (!category || category === 'all') return challenges;
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return challenges;
  const lower = keywords.map(function (k) { return k.toLowerCase(); });
  return challenges.filter(function (c) {
    const text = (c.challenge || c.description || '').toLowerCase();
    return lower.some(function (k) { return text.indexOf(k) !== -1; });
  });
}

// render challenge cards into container (optionally filtered)
function renderChallenges(challenges, category) {
  const container = document.getElementById('challenges-container');
  if (!container) return;

  const filtered = filterByCategory(challenges, category);
  if (filtered.length === 0) {
    container.innerHTML = '<p class="muted">No quests in this category. Try "All Quests" or create one!</p>';
    return;
  }

  container.innerHTML = '';
  filtered.forEach(function (challenge) {
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
        allChallenges = [];
        return;
      }

      allChallenges = challenges;
      renderChallenges(challenges, 'all');
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
