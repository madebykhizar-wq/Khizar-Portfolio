(function () {
  const storageKey = 'mbk-cookie-consent-v1';
  const cookieName = 'mbk_cookie_consent';
  const analyticsId = 'G-Z4F0DLWNJM';

  // Read saved choice from localStorage or fallback cookie
  function readChoice() {
    try {
      const ls = localStorage.getItem(storageKey);
      if (ls === 'accepted' || ls === 'rejected') return ls;
    } catch (error) {
      console.warn('Cookie preference could not be read from localStorage:', error);
    }

    try {
      const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + cookieName + '=([^;]+)'));
      if (match && (match[1] === 'accepted' || match[1] === 'rejected')) {
        return match[1];
      }
    } catch (error) {
      console.warn('Cookie preference could not be read from document.cookie:', error);
    }

    return null;
  }

  // Save choice to both localStorage and document.cookie for cross-browser & mobile persistence
  function saveChoice(choice) {
    try {
      localStorage.setItem(storageKey, choice);
    } catch (error) {
      console.warn('Cookie preference could not be saved to localStorage:', error);
    }

    try {
      const maxAge = 365 * 24 * 60 * 60; // 1 year
      document.cookie = `${cookieName}=${choice};path=/;max-age=${maxAge};SameSite=Lax`;
    } catch (error) {
      console.warn('Cookie preference could not be saved to document.cookie:', error);
    }
  }

  function loadAnalytics() {
    window[`ga-disable-${analyticsId}`] = false;
    if (window.analyticsLoaded) {
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      }
      return;
    }
    window.analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', analyticsId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    script.onerror = function () {
      console.error('Google Analytics could not be loaded after consent.');
    };
    document.head.appendChild(script);
  }

  function initialize() {
    let banner = document.querySelector('.cookie-consent');
    if (!banner) {
      banner = document.createElement('aside');
      banner.className = 'cookie-consent is-hidden';
      banner.setAttribute('aria-label', 'Cookie preferences');
      banner.setAttribute('aria-live', 'polite');
      banner.hidden = true;
      banner.innerHTML = `
        <div class="cookie-consent-content">
          <span class="cookie-consent-icon" aria-hidden="true">🍪</span>
          <p class="cookie-consent-text">
            We use cookies to analyze site traffic and enhance your experience.
            <a href="privacy.html" class="cookie-consent-link">Privacy</a>
          </p>
        </div>
        <div class="cookie-consent-actions">
          <button type="button" class="cookie-btn cookie-btn-reject" data-cookie-reject>Decline</button>
          <button type="button" class="cookie-btn cookie-btn-accept" data-cookie-accept>Accept</button>
        </div>`;
      document.body.appendChild(banner);
    }

    function showBanner() {
      banner.hidden = false;
      banner.classList.remove('is-hidden', 'is-dismissing');
      banner.classList.add('is-visible');
      const acceptBtn = banner.querySelector('[data-cookie-accept]');
      if (acceptBtn) acceptBtn.focus();
    }

    function hideBanner(animate) {
      if (animate) {
        banner.classList.add('is-dismissing');
        setTimeout(function () {
          banner.hidden = true;
          banner.classList.add('is-hidden');
          banner.classList.remove('is-visible', 'is-dismissing');
        }, 240);
      } else {
        banner.hidden = true;
        banner.classList.add('is-hidden');
        banner.classList.remove('is-visible', 'is-dismissing');
      }
    }

    const choice = readChoice();
    if (choice === 'accepted') {
      loadAnalytics();
      hideBanner(false);
    } else if (choice === 'rejected') {
      hideBanner(false);
    } else {
      showBanner();
    }

    banner.querySelector('[data-cookie-accept]').addEventListener('click', function () {
      saveChoice('accepted');
      hideBanner(true);
      loadAnalytics();
    });

    banner.querySelector('[data-cookie-reject]').addEventListener('click', function () {
      saveChoice('rejected');
      window[`ga-disable-${analyticsId}`] = true;
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      hideBanner(true);
    });

    // Delegate clicks for any 'Cookie settings' button (e.g. in footer or privacy policy)
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-cookie-settings], .cookie-settings-trigger');
      if (trigger) {
        e.preventDefault();
        showBanner();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
