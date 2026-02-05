// ca2 frontend - dashboard page (profile, leaderboard, recipe book, pantry quick view)

// run when dashboard loads: redirect if no token, then load profile, leaderboard, recipes
function initDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  loadUserProfile();
  loadLeaderboard();
  loadRecipeBook();
  initLogout();
}

// recipe unlock system: unlock recipes when user has enough points
function checkRecipeUnlocks(points, recipes, unlockedIds, userId, callback) {
  const unlocked = unlockedIds || [];
  const toUnlock = [];
  for (const i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    if (points >= r.required_points && unlocked.indexOf(r.recipe_id) === -1) {
      toUnlock.push(r.recipe_id);
    }
  }
  if (toUnlock.length === 0) {
    callback();
    return;
  }
  let done = 0;
  toUnlock.forEach(function (recipeId) {
    fetch(API_BASE + '/games/user/' + userId + '/recipes/' + recipeId + '/unlock', authHeaders(null, 'POST'))
      .then(function () {
        done++;
        if (done === toUnlock.length) callback();
      })
      .catch(function () {
        done++;
        if (done === toUnlock.length) callback();
      });
  });
}

// load and display chef's recipe book (unlocked vs locked cards)
function loadRecipeBook() {
  const container = document.getElementById('recipe-cards-container');
  if (!container) return;

  const token = getToken();
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.userId;

  // fetch profile for points, then user recipes for unlock status
  fetch(API_BASE + '/games/profile/' + userId, authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (profile) {
      if (profile.error) {
        container.innerHTML = '<p class="error">Failed to load profile</p>';
        return;
      }
      return fetch(API_BASE + '/games/user/' + userId + '/recipes', authHeaders())
        .then(function (res) { return res.json(); })
        .then(function (recipesWithStatus) {
          const unlockedIds = (recipesWithStatus || []).filter(function (r) { return r.unlocked; }).map(function (r) { return r.recipe_id; });
          checkRecipeUnlocks(profile.points, recipesWithStatus || [], unlockedIds, userId, function () {
            // re-fetch user recipes after unlocks so UI is up to date
            fetch(API_BASE + '/games/user/' + userId + '/recipes', authHeaders())
              .then(function (res) { return res.json(); })
              .then(function (list) {
                renderRecipeCards(list || [], container);
              })
              .catch(function () {
                renderRecipeCards(recipesWithStatus || [], container);
              });
          });
        });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load recipes</p>';
    });
}

// render recipe cards (unlocked = light up, locked = dim)
function renderRecipeCards(recipes, container) {
  container.innerHTML = '';
  if (!recipes.length) {
    container.innerHTML = '<p class="muted">No recipes yet.</p>';
    return;
  }
  recipes.forEach(function (r) {
    const card = document.createElement('div');
    card.className = 'recipe-card' + (r.unlocked ? ' recipe-unlocked' : ' recipe-locked');
    card.setAttribute('data-recipe-id', r.recipe_id);
    const icon = document.createElement('span');
    icon.className = 'recipe-card-icon';
    icon.innerHTML = r.unlocked ? '&#127859;' : '&#128274;';
    const name = document.createElement('h4');
    name.className = 'recipe-card-name';
    name.textContent = r.recipe_name;
    const desc = document.createElement('p');
    desc.className = 'recipe-card-desc';
    desc.textContent = r.description || '';
    const pts = document.createElement('p');
    pts.className = 'recipe-card-points';
    pts.textContent = r.unlocked ? 'Unlocked!' : 'Unlock at ' + r.required_points + ' pts';
    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(pts);
    container.appendChild(card);
  });
}

// fetch user profile and display using dom
function loadUserProfile() {
  const profileContainer = document.getElementById('profile-container');
  if (!profileContainer) return;

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

      profileContainer.innerHTML = '';

      const nameBox = document.createElement('h2');
      nameBox.textContent = 'Welcome, ' + data.username + '!';
      profileContainer.appendChild(nameBox);

      const rankBox = document.createElement('p');
      rankBox.className = 'rank-badge';
      rankBox.textContent = data.rank;
      profileContainer.appendChild(rankBox);

      const statsBox = document.createElement('div');
      statsBox.className = 'stats-grid';
      statsBox.innerHTML =
        '<div class="stat-item"><span class="stat-value">' + data.points + '</span><span class="stat-label">Points</span></div>' +
        '<div class="stat-item"><span class="stat-value">' + (data.challenges_completed || 0) + '</span><span class="stat-label">Challenges</span></div>';
      profileContainer.appendChild(statsBox);

      if (data.next_rank) {
        const nextBox = document.createElement('p');
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

      leaderboardContainer.innerHTML = '<h3>Top Chefs</h3>';

      const list = document.createElement('ol');
      list.className = 'leaderboard-list';

      data.leaderboard.forEach(function (user, index) {
        const item = document.createElement('li');
        item.className = 'leaderboard-item';
        if (index < 3) item.classList.add('top-' + (index + 1));

        const nameSpan = document.createElement('span');
        nameSpan.className = 'lb-name';
        if (index === 0) nameSpan.innerHTML = '&#129351; ' + user.username;
        else if (index === 1) nameSpan.innerHTML = '&#129352; ' + user.username;
        else if (index === 2) nameSpan.innerHTML = '&#129353; ' + user.username;
        else nameSpan.textContent = user.username;

        const pointsSpan = document.createElement('span');
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
