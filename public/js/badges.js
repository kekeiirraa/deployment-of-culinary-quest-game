// ca2 frontend - badges page (earned badges, all badges, chef ranks)

// all 5 chef ranks with image filenames and point thresholds
const CHEF_RANKS = [
  { name: 'Kitchen Novice', points: 0, ability: 'Basic cooking tools', image: 'kitchennovice.png' },
  { name: 'Apprentice Chef', points: 100, ability: 'Unlock recipe creation', image: 'apprenticechef.png' },
  { name: 'Sous Chef', points: 300, ability: 'Team challenge bonuses', image: 'souschef.png' },
  { name: 'Master Chef', points: 600, ability: 'Custom challenge creation', image: 'masterchef.png' },
  { name: 'Grand Gastromancer', points: 1000, ability: 'Legendary status', image: 'grandgastromancer.png' }
];

// run when badges page loads: require login, then load ranks, earned badges, all badges
function initBadges() {
  if (!requireAuth()) return;
  const userId = getUserIdFromToken();
  loadChefRanks(userId);
  loadEarnedBadges(userId);
  loadAllBadges(userId);
  initLogout();
}

// fetch user profile for current rank/points, then display all 5 chef ranks with images
function loadChefRanks(userId) {
  const container = document.getElementById('chef-ranks-container');
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading ranks...</p>';

  fetch(API_BASE + '/games/profile/' + userId, authHeaders())
    .then(function (res) { return res.json(); })
    .then(function (profile) {
      const currentRank = (profile && profile.rank) ? profile.rank : 'Kitchen Novice';
      const userPoints = (profile && profile.points) ? profile.points : 0;

      container.innerHTML = '';
      CHEF_RANKS.forEach(function (rank) {
        const card = document.createElement('div');
        const isCurrent = (rank.name === currentRank);
        card.className = 'chef-rank-card' + (isCurrent ? ' chef-rank-current' : '');

        const img = document.createElement('img');
        img.src = 'images/' + rank.image;
        img.alt = rank.name;
        img.className = 'chef-rank-image';

        const name = document.createElement('h4');
        name.className = 'chef-rank-name';
        name.textContent = rank.name;

        const points = document.createElement('p');
        points.className = 'chef-rank-points';
        points.textContent = rank.points === 0 ? 'Starting rank' : rank.points + ' pts to unlock';

        const ability = document.createElement('p');
        ability.className = 'chef-rank-ability';
        ability.textContent = rank.ability;

        card.appendChild(img);
        card.appendChild(name);
        if (isCurrent) {
          const badge = document.createElement('span');
          badge.className = 'chef-rank-you-are-here';
          badge.textContent = 'You are here';
          card.appendChild(badge);
        }
        card.appendChild(points);
        card.appendChild(ability);
        container.appendChild(card);
      });
    })
    .catch(function () {
      container.innerHTML = '<p class="error">Failed to load ranks</p>';
    });
}

// fetch and display user's earned badges
function loadEarnedBadges(userId) {
  const container = document.getElementById('earned-badges-container');
  const countBox = document.getElementById('earned-count');
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
  const card = document.createElement('div');
  card.className = 'badge-card' + (earned ? ' badge-earned' : '');

  const icon = document.createElement('div');
  icon.className = 'badge-icon';
  icon.innerHTML = earned ? '&#129351;' : '&#128274;';

  const name = document.createElement('h4');
  name.className = 'badge-name';
  name.textContent = badge.badge_name;

  const desc = document.createElement('p');
  desc.className = 'badge-desc';
  desc.textContent = badge.description;

  card.appendChild(icon);
  card.appendChild(name);
  card.appendChild(desc);

  if (earned && badge.earned_date) {
    const date = document.createElement('p');
    date.className = 'badge-date';
    date.textContent = 'Earned: ' + new Date(badge.earned_date).toLocaleDateString();
    card.appendChild(date);
  }

  return card;
}
