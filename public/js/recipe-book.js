// ca2 frontend - chef's cookbook page (unlocked / locked recipes)
// fetches user recipes with unlock status from backend and shows unlocked vs locked sections

function initRecipeBook() {
  if (!requireAuth()) return;
  const userId = getUserIdFromToken();
  loadUserRecipes(userId);
}

// fetch recipes with unlocked flag for this user and fill unlocked/locked containers
function loadUserRecipes(userId) {
  const unlockedContainer = document.getElementById('unlocked-recipes-container');
  const lockedContainer = document.getElementById('locked-recipes-container');
  if (!unlockedContainer || !lockedContainer) return;

  fetch(API_BASE + '/games/user/' + userId + '/recipes', authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (list) {
      const unlocked = (list || []).filter(function (r) { return r.unlocked; });
      const locked = (list || []).filter(function (r) { return !r.unlocked; });

      if (unlocked.length === 0) {
        unlockedContainer.innerHTML = '<p class="muted">No recipes unlocked yet. Earn points to unlock!</p>';
      } else {
        unlockedContainer.innerHTML = '';
        unlocked.forEach(function (r) {
          unlockedContainer.appendChild(createRecipeCard(r, true));
        });
      }

      if (locked.length === 0) {
        lockedContainer.innerHTML = '<p class="muted">You have unlocked all recipes!</p>';
      } else {
        lockedContainer.innerHTML = '';
        locked.forEach(function (r) {
          lockedContainer.appendChild(createRecipeCard(r, false));
        });
      }
    })
    .catch(function () {
      unlockedContainer.innerHTML = '<p class="muted">Complete more activities to unlock recipes. Earn points by completing Kitchen Quests.</p>' +
        '<p><a href="challenges.html" class="btn-secondary">Go to Kitchen Quests</a></p>';
      if (lockedContainer) lockedContainer.innerHTML = '';
    });
}

function createRecipeCard(r, unlocked) {
  const card = document.createElement('div');
  card.className = 'recipe-card' + (unlocked ? ' recipe-unlocked' : ' recipe-locked');
  card.setAttribute('data-recipe-id', r.recipe_id);
  const icon = document.createElement('span');
  icon.className = 'recipe-card-icon';
  icon.innerHTML = unlocked ? '&#127859;' : '&#128274;';
  const name = document.createElement('h4');
  name.className = 'recipe-card-name';
  name.textContent = r.recipe_name;
  const desc = document.createElement('p');
  desc.className = 'recipe-card-desc';
  desc.textContent = r.description || '';
  const pts = document.createElement('p');
  pts.className = 'recipe-card-points';
  pts.textContent = unlocked ? 'Unlocked!' : 'Unlock at ' + r.required_points + ' pts';
  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(desc);
  card.appendChild(pts);
  return card;
}
