(function () {
  const storageKey = 'mbk-cookie-consent-v1';
  const analyticsId = 'G-Z4F0DLWNJM';

  function readChoice() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.warn('Cookie preference could not be read:', error);
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(storageKey, choice);
    } catch (error) {
      console.warn('Cookie preference could not be saved:', error);
    }
  }

  function loadAnalytics() {
    window[`ga-disable-${analyticsId}`] = false;
    if (window.analyticsLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
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
    const banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.setAttribute('aria-live', 'polite');
    banner.hidden = true;
    banner.innerHTML = `
      <div class="cookie-consent-copy">
        <strong>Your privacy matters</strong>
        <p>Essential storage keeps your choice. Optional analytics help understand site visits and only load if you accept.</p>
      </div>
      <div class="cookie-consent-actions">
        <button type="button" data-cookie-reject>Reject optional</button>
        <button type="button" class="cookie-accept" data-cookie-accept>Accept analytics</button>
      </div>`;

    const settings = document.createElement('button');
    settings.className = 'cookie-settings-trigger';
    settings.type = 'button';
    settings.textContent = 'Cookie settings';
    settings.setAttribute('aria-label', 'Open cookie settings');

    document.body.append(banner, settings);

    const choice = readChoice();
    if (choice === 'accepted') loadAnalytics();
    if (choice !== 'accepted' && choice !== 'rejected') banner.hidden = false;

    banner.querySelector('[data-cookie-accept]').addEventListener('click', function () {
      saveChoice('accepted');
      banner.hidden = true;
      loadAnalytics();
    });
    banner.querySelector('[data-cookie-reject]').addEventListener('click', function () {
      saveChoice('rejected');
      window[`ga-disable-${analyticsId}`] = true;
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      banner.hidden = true;
    });
    settings.addEventListener('click', function () {
      banner.hidden = false;
      banner.querySelector('[data-cookie-accept]').focus();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
