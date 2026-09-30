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

    let mouseX = -100;
    let mouseY = -100;
    let rafPending = false;

    function renderCursor() {
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      rafPending = false;
    }

    // Follow the mouse in real time using GPU translate3d with zero layout thrashing
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    // Click animation: expand + fade the ring (::after pseudo-element)
    window.addEventListener('mousedown', () => cursor.classList.add('click'), { passive: true });
    window.addEventListener('mouseup', () => {
      setTimeout(() => cursor.classList.remove('click'), 350);
    }, { passive: true });

    // Hide while the pointer is outside the window
    document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));

    // Grow slightly over interactive elements with passive event listeners
    const hoverTargets = 'a, button, input, textarea, select, .work-card, .btn, .brand-chip, .services-pill';
    document.addEventListener('mouseover', (e) => {
      if (e.target && e.target.closest && e.target.closest(hoverTargets)) {
        cursor.classList.add('hoverable');
      }
    }, { passive: true });
    document.addEventListener('mouseout', (e) => {
      if (e.target && e.target.closest && e.target.closest(hoverTargets)) {
        cursor.classList.remove('hoverable');
      }
    }, { passive: true });
  });
})();
