// ca2 frontend - create challenge page
// when user submits we send description and points to backend; backend checks cooking-themed and saves challenge

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

    // client-side validation: description at least 10 chars, points between 1 and 100
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

    // send create challenge request; backend validates cooking-themed then inserts into database
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
