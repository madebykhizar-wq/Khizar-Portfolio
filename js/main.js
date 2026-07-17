// Shared interactive behaviors — runs after render.js has built the DOM.
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- page fade-in (avoids a flash of unstyled/empty content) ---------- */
  requestAnimationFrame(() => document.body.classList.add('page-ready'));

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.textContent = open ? 'Close' : 'Menu';
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.textContent = 'Menu';
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- scroll-reveal animations ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- dark / light mode toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'khizar-theme';
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    if (themeToggle) themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* storage unavailable, ignore */ }
  }
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { /* ignore */ }
  setTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- subtle hero parallax (decorative background blob only) ---------- */
  const heroEl = document.querySelector('.hero');
  if (heroEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const updateParallax = () => {
      const offset = Math.min(window.scrollY, 600) * 0.12;
      heroEl.style.setProperty('--parallax-y', offset + 'px');
    };
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
  }

  /* ---------- scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- back to top floating button ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleVisible = () => {
      backToTop.classList.toggle('visible', window.scrollY > 480);
    };
    window.addEventListener('scroll', toggleVisible, { passive: true });
    toggleVisible();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- copy email button ---------- */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = document.getElementById('contactEmailLink')?.textContent?.trim();
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        const original = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied!';
        setTimeout(() => { copyEmailBtn.textContent = original; }, 1800);
      } catch (e) {
        // Clipboard API unavailable — fail silently, the email is still a visible mailto link
      }
    });
  }

  /* ---------- animated counters (stats) ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animate = (el) => {
      const target = el.getAttribute('data-counter');
      const numMatch = target.match(/[\d.]+/);
      if (!numMatch) { el.textContent = target; return; }
      const num = parseFloat(numMatch[0]);
      const suffix = target.replace(numMatch[0], '');
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(num * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          counterIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterIo.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  const faqList = document.getElementById('faq-list');
  if (faqList) {
    faqList.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close any other open item (accordion behavior)
      faqList.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.closest('.faq-item').querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  }

  /* ---------- contact form — sends via FormSubmit.co (no backend needed) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const cfg = window.SITE_CONFIG;
    const submitBtn = contactForm.querySelector('.btn');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    const destinationEmail = cfg && cfg.personal && cfg.personal.email;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!destinationEmail) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const formData = new FormData(contactForm);
        formData.append('_subject', `New project inquiry from ${formData.get('name') || 'website visitor'}`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destinationEmail)}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if (!res.ok) throw new Error('Request failed');

        submitBtn.textContent = 'Message received →';
        submitBtn.style.opacity = 0.7;
        contactForm.reset();
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        alert(`Something went wrong sending that. Please email me directly at ${destinationEmail}.`);
      }
    });
  }
});
