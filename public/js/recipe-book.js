// ca2 frontend - chef's cookbook page (unlocked / locked recipes)

function initRecipeBook() {
  if (!requireAuth()) return;
  var userId = getUserIdFromToken();
  loadUserRecipes(userId);
}

function loadUserRecipes(userId) {
  var unlockedContainer = document.getElementById('unlocked-recipes-container');
  var lockedContainer = document.getElementById('locked-recipes-container');
  if (!unlockedContainer || !lockedContainer) return;

  fetch(API_BASE + '/games/user/' + userId + '/recipes', authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (list) {
      var unlocked = (list || []).filter(function (r) { return r.unlocked; });
      var locked = (list || []).filter(function (r) { return !r.unlocked; });

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
      unlockedContainer.innerHTML = '<p class="error">Failed to load recipes</p>';
      if (lockedContainer) lockedContainer.innerHTML = '';
    });
}

function createRecipeCard(r, unlocked) {
  var card = document.createElement('div');
  card.className = 'recipe-card' + (unlocked ? ' recipe-unlocked' : ' recipe-locked');
  card.setAttribute('data-recipe-id', r.recipe_id);
  var icon = document.createElement('span');
  icon.className = 'recipe-card-icon';
  icon.innerHTML = unlocked ? '&#127859;' : '&#128274;';
  var name = document.createElement('h4');
  name.className = 'recipe-card-name';
  name.textContent = r.recipe_name;
  var desc = document.createElement('p');
  desc.className = 'recipe-card-desc';
  desc.textContent = r.description || '';
  var pts = document.createElement('p');
  pts.className = 'recipe-card-points';
  pts.textContent = unlocked ? 'Unlocked!' : 'Unlock at ' + r.required_points + ' pts';
  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(desc);
  card.appendChild(pts);
  return card;
}
