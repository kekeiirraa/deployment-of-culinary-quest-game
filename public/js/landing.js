// ca2 frontend - index / landing page
// show guest section (log in, register) or logged section (dashboard link) and nav based on token

function initIndex() {
  const token = getToken();
  const guestSection = document.getElementById('guest-section');
  const loggedSection = document.getElementById('logged-section');
  const guestNav = document.getElementById('guest-nav');
  const loggedNav = document.getElementById('logged-nav');

  if (token && loggedSection) {
    if (guestSection) guestSection.classList.add('hidden');
    loggedSection.classList.remove('hidden');
    if (guestNav) guestNav.classList.add('hidden');
    if (loggedNav) loggedNav.classList.remove('hidden');
  } else if (guestSection) {
    guestSection.classList.remove('hidden');
    if (loggedSection) loggedSection.classList.add('hidden');
    if (guestNav) guestNav.classList.remove('hidden');
    if (loggedNav) loggedNav.classList.add('hidden');
  }
}
