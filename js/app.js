document.addEventListener('DOMContentLoaded', () => {
  // Highlight current nav item
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-bar a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Check if children exist, prompt if not (only on non-profile pages)
  if (page !== 'profile.html' && ChildStore.getAll().length === 0) {
    const tip = document.getElementById('no-child-tip');
    if (tip) tip.style.display = 'block';
  }
});
