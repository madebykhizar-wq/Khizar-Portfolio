/**
 * Khizar Hayat Portfolio — Brand Greeting Preloader
 * Cycles rapidly through greetings in multiple world languages on a solid dark green background,
 * then smoothly pulls up the curtain to reveal the portfolio.
 */
(function () {
  'use strict';

  const GREETINGS = [
    { word: 'Hello', duration: 260 },
    { word: 'Bonjour', duration: 180 },
    { word: 'مرحباً', duration: 180 },
    { word: 'سلام', duration: 180 },
    { word: 'नमस्ते', duration: 180 },
    { word: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ', duration: 190 },
    { word: '¡Hola!', duration: 175 },
    { word: 'Ciao', duration: 175 },
    { word: 'こんにちは', duration: 180 },
    { word: 'Hallo', duration: 175 },
    { word: '你好', duration: 175 },
    { word: 'Merhaba', duration: 175 },
    { word: 'Olá', duration: 175 },
    { word: 'Hello', duration: 420 }
  ];

  function initIntro() {
    const preloader = document.getElementById('intro-preloader');
    if (!preloader) return;

    const wordEl = document.getElementById('introGreetingText');
    const contentEl = document.getElementById('introContent');

    let isFinished = false;
    let timerId = null;

    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      finishIntro();
      return;
    }

    function setGreeting(index) {
      if (isFinished) return;
      const item = GREETINGS[index];
      if (!item) {
        finishIntro();
        return;
      }

      // Fast kinetic micro-transition
      if (wordEl) {
        wordEl.classList.add('is-transitioning');
        setTimeout(() => {
          if (isFinished) return;
          wordEl.textContent = item.word;
          wordEl.classList.remove('is-transitioning');
        }, 35);
      } else {
        if (wordEl) wordEl.textContent = item.word;
      }

      if (index < GREETINGS.length - 1) {
        timerId = setTimeout(() => {
          setGreeting(index + 1);
        }, item.duration);
      } else {
        // Final greeting completed — trigger curtain reveal
        timerId = setTimeout(() => {
          finishIntro();
        }, item.duration);
      }
    }

    function finishIntro() {
      if (isFinished) return;
      isFinished = true;
      if (timerId) clearTimeout(timerId);

      // Dispatch event for hero animation to start synchronously with curtain lift
      document.dispatchEvent(new CustomEvent('intro-reveal-start'));

      if (contentEl) {
        contentEl.classList.add('intro-content-out');
      }

      // Start curtain upward glide
      setTimeout(() => {
        preloader.classList.add('intro-slide-up');
        preloader.setAttribute('aria-hidden', 'true');

        // Unlock page scrolling
        document.body.classList.remove('has-intro');

        // Cleanup after transition finishes
        setTimeout(() => {
          preloader.classList.add('intro-complete');
        }, 900);
      }, 150);
    }

    // Optional click or Escape to skip directly
    preloader.addEventListener('click', finishIntro);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !isFinished) {
        finishIntro();
      }
    }, { once: true });

    // Begin sequence
    setGreeting(0);
  }

  // Execute immediately if DOM ready, or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
