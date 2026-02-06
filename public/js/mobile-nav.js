// mobile: hamburger button opens drawer; overlay and close button close it
// used on app pages when top nav is hidden on phone

function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = drawer ? drawer.querySelector('.drawer-close') : null;

  function openDrawer() {
    if (drawer) {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', openDrawer);
  }
  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }
}
