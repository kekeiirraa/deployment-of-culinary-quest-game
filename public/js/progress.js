// ca2 frontend - progress page (track completed challenges and points)

// run when progress page loads: require login, then load summary and completed challenges
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
