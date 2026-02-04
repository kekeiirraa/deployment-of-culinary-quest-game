// ca2 frontend - badges page (earned and all available badges)

// run when badges page loads: require login, then load earned badges and all badges
function initBadges() {
  if (!requireAuth()) return;
  var userId = getUserIdFromToken();
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
        var card = createBadgeCard(badge, true);
        container.appendChild(card);
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load badges</p>';
    });
}

// fetch and display all available badges
function loadAllBadges(userId) {
  var container = document.getElementById('all-badges-container');
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
        var card = createBadgeCard(badge, false);
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
