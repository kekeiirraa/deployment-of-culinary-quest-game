// ca2 frontend - create challenge page

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
    const points = parseInt(document.getElementById('points').value, 10);
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

    fetch(API_BASE + '/challenges', authHeaders({ description: description, points: points, user_id: userId }))
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
            btn.textContent = 'Create Kitchen Quest';
          }
        });
      })
      .catch(function () {
        showError('message', 'Network error. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Create Kitchen Quest';
      });
  });
}
