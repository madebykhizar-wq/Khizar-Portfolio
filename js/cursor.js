// Custom cursor — replaces the native cursor with a div that tracks
// the mouse in real time, plus a ring that expands on click.
// Only activates on devices with a precise pointer (mouse/trackpad)
// and when the visitor hasn't asked for reduced motion — on touch
// devices or with reduced motion, the native cursor is left alone.
(function () {
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || reducedMotion) return;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('custom-cursor-active');

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    // Follow the mouse in real time, centered on the pointer
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    // Click animation: expand + fade the ring (::after pseudo-element)
    window.addEventListener('mousedown', () => cursor.classList.add('click'));
    window.addEventListener('mouseup', () => {
      setTimeout(() => cursor.classList.remove('click'), 400);
    });

    // Hide while the pointer is outside the window
    document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));

    // Grow slightly over interactive elements
    const hoverTargets = 'a, button, input, textarea, .work-card, .btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.add('hoverable');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.remove('hoverable');
    });
  });
})();
