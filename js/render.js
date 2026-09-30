/* =========================================================
   RENDER ENGINE
   ---------------------------------------------------------
   Reads SITE_CONFIG (config.js) and builds every dynamic
   part of the page. You should not need to edit this file —
   change content in config.js instead.
   ========================================================= */

(function () {
  const cfg = window.SITE_CONFIG;
  if (!cfg) return;

  const page = document.body.getAttribute("data-page") || "home";

  /* ---------- small helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $all = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (str) => String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const safeUrl = (value, fallback) => {
    if (!value) return fallback || "";
    try {
      const url = new URL(String(value), window.location.href);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : fallback || "";
    } catch {
      return fallback || "";
    }
  };

  /* ---------- CSS variables from config.colors / typography ---------- */
  function applyTheme() {
    const c = cfg.colors || {};
    // IMPORTANT: these are written into a <style> tag (a real stylesheet
    // rule) rather than set as inline styles on <html>. Inline styles
    // would always beat the html[data-theme="dark"] rule in styles.css
    // regardless of its selector specificity, which would silently break
    // dark mode. A :root rule in a <style> tag has normal specificity, so
    // the dark-mode override in styles.css can still win when active.
    const css = `:root{
      --white:${c.background};
      --paper:${c.backgroundAlt};
      --ink:${c.text};
      --ink-2:${c.dark};
      --text-soft:${c.textSoft};
      --accent:${c.primary};
      --accent-2:${c.secondary};
      --highlight:${c.accent};
    }`;
    let tag = document.getElementById("config-theme-vars");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "config-theme-vars";
      document.head.appendChild(tag);
    }
    tag.textContent = css;

    const t = cfg.typography || {};
    const root = document.documentElement.style;
    root.setProperty("--font-heading", t.headingFont);
    root.setProperty("--font-body", t.bodyFont);
    root.setProperty("--font-mono", t.monoFont);

    document.body.style.fontFamily = "var(--font-body)";
  }

  /* ---------- favicon / title / meta ---------- */
  /* ---------- favicon / title / meta ---------- */
  function applyMeta() {
    const brand = cfg.brand || {};
    function setIconLink(rel, href, sizes, type) {
      if (!href) return;
      let sel = sizes ? `link[rel="${rel}"][sizes="${sizes}"]` : (type ? `link[rel="${rel}"][type="${type}"]` : `link[rel="${rel}"]`);
      let link = $(sel);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        if (type) link.type = type;
        document.head.appendChild(link);
      }
      link.href = href;
    }
    setIconLink("icon", "/favicon.ico", "any");
    setIconLink("icon", brand.faviconSvg || "assets/logo.svg", null, "image/svg+xml");
    setIconLink("icon", brand.favicon || "assets/favicon-48.png", "48x48", "image/png");
    setIconLink("icon", brand.favicon96 || "assets/favicon-96.png", "96x96", "image/png");
    setIconLink("icon", brand.favicon192 || "assets/favicon-192.png", "192x192", "image/png");
    setIconLink("icon", brand.faviconSmall || "assets/favicon-32.png", "32x32", "image/png");
    setIconLink("apple-touch-icon", brand.appleTouchIcon || "assets/favicon-180.png");

    const seoPage = cfg.seo && cfg.seo.pages && cfg.seo.pages[page];
    if (seoPage) {
      document.title = seoPage.title;
      let desc = $('meta[name="description"]');
      if (!desc) {
        desc = document.createElement("meta");
        desc.name = "description";
        document.head.appendChild(desc);
      }
      desc.content = seoPage.description;
    }
  }

  /* ---------- Google Fonts ---------- */
  function applyFonts() {
    if (cfg.typography && cfg.typography.googleFontsUrl) {
      const existing = $(`link[href="${cfg.typography.googleFontsUrl}"]`);
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cfg.typography.googleFontsUrl;
        document.head.appendChild(link);
      }
    }
  }

  /* ---------- header / nav (shared across every page) ---------- */
  function renderNav() {
    const nav = $("#site-nav");
    if (!nav) return;

    const wordmark = (() => {
      const parts = cfg.brand.logoText.split(".");
      if (parts.length === 1) return esc(parts[0]);
      return `${esc(parts[0])}<span>.</span>${esc(parts.slice(1).join("."))}`;
    })();
    const iconHtml = cfg.brand.logoImage
      ? `<img src="${esc(cfg.brand.logoImage)}" alt="" class="logo-img">`
      : "";
    const revealHtml = cfg.brand.madeBy
      ? `<span class="logo-reveal">${esc(cfg.brand.madeBy)}</span>`
      : "";
    const logoHtml = iconHtml + wordmark + revealHtml;

    const homeHref = page === "home" ? "#top" : "index.html#top";
    const contactHref = page === "home" ? "#contact" : "index.html#contact";

    const links = cfg.nav.map(item => {
      const isActive = page === "home" ? "" : page === item.key ? " active" : "";
      const href = page === "home" ? item.href : `index.html${item.href}`;
      return `<a href="${esc(href)}" class="${isActive.trim()}">${esc(item.label)}</a>`;
    }).join("\n");

    nav.innerHTML = `
      <a href="${homeHref}" class="logo">${logoHtml}</a>
      <button class="navtoggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">Menu</button>
      <div class="navlinks" id="navLinks">
        <div class="nav-menu" aria-label="Main navigation">${links}</div>
        <div class="nav-actions">
          <a href="${contactHref}" class="cta">${esc(cfg.navCtaText || "Start a Project")}</a>
          <label class="language-control">
            <span class="sr-only">Language</span>
            <select id="languageSelect" aria-label="Choose language">
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
            </select>
          </label>
          <a href="#" data-social-link="whatsapp" target="_blank" rel="noopener" class="whatsapp-nav" aria-label="Message on WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4ZM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18.1c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 0 1 3.9 12c0-4.5 3.6-8.1 8.1-8.1s8.1 3.6 8.1 8.1-3.6 8.1-8.1 8.1Z"/></svg>
            <span>WhatsApp</span>
          </a>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" type="button">🌙</button>
        </div>
      </div>`;
  }

  /* ---------- footer ---------- */
  function renderFooter() {
    const footer = $("#site-footer");
    if (!footer) return;
    const backHref = page === "home" ? "#top" : "index.html";
    const backLabel = page === "home" ? "Back to top ↑" : "Back to home ↑";
    const madeByHtml = cfg.brand.madeBy
      ? `<span class="footer-brand">
           ${cfg.brand.logoImage ? `<img src="${esc(cfg.brand.logoImage)}" alt="" class="footer-logo">` : ""}
           ${esc(cfg.brand.madeBy)}
         </span>`
      : "";
    footer.innerHTML = `
      <span>© ${esc(cfg.footer.copyrightYear)} ${esc(cfg.footer.copyrightName)}</span>
      ${madeByHtml}
      <nav class="footer-policies" aria-label="Policies">
        <a href="privacy.html">Privacy</a>
        <a href="terms.html">Terms</a>
        <a href="refund-policy.html">Refund policy</a>
      </nav>
      <span><a href="${backHref}" id="footerBackLink">${backLabel}</a></span>`;
  }

  /* ---------- hero (home only) ---------- */
  function renderHero() {
    const el = $("#hero-content");
    if (!el) return;

    const badge = $("#hero-badge");
    if (badge) {
      const target = badge.querySelector(".live-text") || badge.querySelector("span:last-child");
      if (target) target.textContent = cfg.hero.badge || cfg.personal.availabilityBadge || "Available for Brand & Packaging Systems";
    }

    const titleEl = el.querySelector(".hero-master-title") || el.querySelector("h1");
    if (titleEl && cfg.hero.headline) {
      titleEl.innerHTML = cfg.hero.headline;
    }

    const bioEl = el.querySelector(".hero-description") || el.querySelector(".hero-side p");
    if (bioEl && cfg.personal.shortBio) bioEl.innerHTML = cfg.personal.shortBio;

    const cta = el.querySelector(".hero-cta");
    if (cta) {
      cta.href = cfg.cta.link;
      const btnText = cta.querySelector(".btn-text");
      if (btnText) btnText.textContent = cfg.cta.text;
      if (/^https?:\/\//i.test(cfg.cta.link)) {
        cta.target = "_blank";
        cta.rel = "noopener";
      }
    }

    const HERO_ICONS = {
      star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>`,
      target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>`,
      calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8.5 15l2 2 4-4"/></svg>`,
      package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>`
    };

    const chips = (cfg.hero.chips || []).map(c => ({ icon: HERO_ICONS[c.icon] || "", label: c.label }));
    const chipsEl = $("#hero-chips");
    if (chipsEl) {
      chipsEl.innerHTML = chips.map(c => `
        <div class="hero-chip"><span class="chip-icon">${c.icon}</span><span>${esc(c.label)}</span></div>`).join("");
    }
  }

  const CLIENT_LOGOS = {
    hyundai: `<svg viewBox="0 0 32 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><ellipse cx="16" cy="10" rx="14" ry="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 16V4h2.5l4.5 8.2V4H21v12h-2.5L14 7.8V16z" transform="skewX(-14) translate(2,0)"/></svg>`,
    suzuki: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M5 2h14l-10 8h11l-2 3H4l10-8H3z"/></svg>`,
    go: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M12 2C8 6 5 10 5 14a7 7 0 0 0 14 0c0-4-3-8-7-12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="13" r="2.5"/></svg>`,
    boss: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M3 16h18v2H3zm1.5-4l3 1.5 4.5-7 4.5 7 3-1.5v3h-15z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="4.5" cy="10" r="1.2"/><circle cx="12" cy="5.5" r="1.2"/><circle cx="19.5" cy="10" r="1.2"/></svg>`,
    jojo: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><circle cx="12" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 8c2-2 5.5-2 7.5 0s2 5.5 0 7.5-5.5 2-7.5 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    bioxy: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M12 3c3 3 7 7 7 11a7 7 0 0 1-14 0c0-4 4-8 7-11z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v9M9.5 12.5c1.5-1.5 3.5-1.5 5 0" stroke="currentColor" stroke-width="1.5"/></svg>`,
    synvora: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><polygon points="12,2 20,6.5 20,15 12,19.5 4,15 4,6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10.5" r="2.5"/><line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" stroke-width="1.4"/><line x1="20" y1="15" x2="14.5" y2="12" stroke="currentColor" stroke-width="1.4"/><line x1="4" y1="15" x2="9.5" y2="12" stroke="currentColor" stroke-width="1.4"/></svg>`,
    burger: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M6 8c0-3.5 3-5.5 6-5.5s6 2 6 5.5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 11h15M5 14h14" stroke="currentColor" stroke-width="1.6"/><rect x="6" y="16.5" width="12" height="2.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    move: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M13 2L6 11h6l-1.5 7 8.5-9.5h-5.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    wheels: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><circle cx="12" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.5"/><path d="M12 2v5.5M12 12.5v5.5M4 10h5.5M14.5 10H20" stroke="currentColor" stroke-width="1.5"/></svg>`,
    wirsa: `<svg viewBox="0 0 24 20" class="brand-chip-svg" fill="currentColor" aria-hidden="true"><path d="M6 18V9.5a6 6 0 0 1 12 0V18" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 4v5M9.5 18v-7a2.5 2.5 0 0 1 5 0v7" stroke="currentColor" stroke-width="1.4"/></svg>`
  };

  /* ---------- client names with real logos ---------- */
  function renderClientBrands() {
    const el = $("#brand-list");
    if (!el || !cfg.clientBrands) return;
    const itemsHtml = cfg.clientBrands.map(b => {
      if (typeof b === "string") {
        return `<li class="brand-chip brand-chip-text" title="${esc(b)}"><span class="brand-chip-wordmark">${esc(b)}</span></li>`;
      }

      // 1. Priority 1: Real uploaded logo image -> Show JUST the logo cleanly!
      if (b.logoImage && b.logoImage.trim()) {
        return `<li class="brand-chip brand-chip-logo" title="${esc(b.name)}">
          <img
            src="${esc(b.logoImage)}"
            alt="${esc(b.name)}"
            class="brand-chip-img"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<span class=\\'brand-chip-wordmark\\'>${esc(b.name)}</span>'"
          >
        </li>`;
      }

      // 2. Priority 2: Built-in SVG emblem
      const svgIcon = CLIENT_LOGOS[b.logo] || "";
      if (svgIcon) {
        return `<li class="brand-chip brand-chip-logo" title="${esc(b.name)}">
          <span class="brand-chip-svg-wrap" aria-label="${esc(b.name)}">${svgIcon}</span>
        </li>`;
      }

      // 3. Priority 3: Clean typographic brand name (wordmark)
      return `<li class="brand-chip brand-chip-text" title="${esc(b.name)}">
        <span class="brand-chip-wordmark">${esc(b.name)}</span>
      </li>`;
    }).join("");
    el.innerHTML = itemsHtml;
    const duplicate = $("#brand-list-duplicate");
    if (duplicate) duplicate.innerHTML = itemsHtml;
  }
  window.renderClientBrands = renderClientBrands;
  document.addEventListener("site-client-brands-ready", renderClientBrands);


  /* ---------- services marquee (below selected clients) ---------- */
  function renderServicesMarquee() {
    const el = $("#services-marquee-list");
    if (!el) return;
    const services = cfg.marquee || [
      "Brand Identity", "Logo Systems", "Packaging Design",
      "Brand Guidelines", "Visual Strategy", "Social & Collateral"
    ];
    const html = services.map(s => `
      <span class="services-pill">
        <span class="services-sparkle" aria-hidden="true">✦</span>
        <span>${esc(s)}</span>
      </span>
    `).join("");
    el.innerHTML = html;
    const duplicate = $("#services-marquee-list-duplicate");
    if (duplicate) duplicate.innerHTML = html;
  }

  /* ---------- project card markup ---------- */
  function projectCard(p, tagOverride) {
    const thumbnail = esc(safeUrl(p.thumbnail));
    const description = esc(p.description);
    const pId = esc(String(p.id || p.title));
    const featuredBackdrop = p.featured
      ? `<img class="work-card-backdrop" src="${thumbnail}" alt="" aria-hidden="true" loading="lazy">`
      : "";
    return `
      <article class="work-card reveal${p.featured ? " feature" : ""}" data-project-id="${pId}" role="button" tabindex="0" aria-haspopup="dialog" aria-label="${esc(p.title)}. ${description} Click to view project case study.">
        <span class="work-tag">${esc(tagOverride || p.cardLabel)}</span>
        ${featuredBackdrop}
        <img src="${thumbnail}" alt="${esc(p.title)} project preview" loading="lazy" decoding="async">
        <div class="work-overlay">
          <div class="cat">${esc(p.category)} / ${esc(p.tag)}</div>
          <h3>${esc(p.title)}</h3>
          <p>${description}</p>
          <span class="go">Open Case Study ✦</span>
        </div>
      </article>`;
  }

  /* ---------- Case Study Modal ---------- */
  function ensureCaseStudyModal() {
    let modal = $("#caseStudyModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "caseStudyModal";
    modal.className = "case-study-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="cs-modal-backdrop" id="csBackdrop"></div>
      <div class="cs-modal-container" role="document">
        <div class="cs-modal-header">
          <div class="cs-header-left">
            <span class="cs-badge" id="csBadge">Identity</span>
            <span class="cs-year" id="csYear">2026</span>
          </div>
          <button type="button" class="cs-close-btn" id="csCloseBtn" aria-label="Close case study">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="cs-modal-content">
          <div class="cs-intro">
            <h2 class="cs-title" id="csTitle">Project Title</h2>
            <p class="cs-desc" id="csDesc">Project description goes here.</p>
            <div class="cs-meta-row">
              <div class="cs-meta-col">
                <span class="cs-label">Client</span>
                <span class="cs-val" id="csClient">Client Name</span>
              </div>
              <div class="cs-meta-col">
                <span class="cs-label">Discipline / Services</span>
                <div class="cs-services-list" id="csServicesList"></div>
              </div>
            </div>
          </div>

          <div class="cs-gallery" id="csGallery">
            <!-- Full case study images stacked cleanly -->
          </div>

          <div class="cs-bottom-bar">
            <div class="cs-cta-group">
              <a id="csBehanceBtn" href="#" target="_blank" rel="noopener" class="btn solid cs-behance-link">
                <span>View Full Case Study on Behance</span>
                <span class="arrow">↗</span>
              </a>
              <a id="csWebsiteBtn" href="#" target="_blank" rel="noopener" class="btn outline cs-website-link" style="display:none;">
                <span>Visit Live Website</span>
                <span class="arrow">↗</span>
              </a>
            </div>
            <button type="button" class="cs-back-link" id="csCloseBottomBtn">
              ← Return to Projects
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => closeCaseStudyModal();
    $("#csCloseBtn", modal).addEventListener("click", close);
    $("#csCloseBottomBtn", modal).addEventListener("click", close);
    $("#csBackdrop", modal).addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        close();
      }
    });

    return modal;
  }

  function openCaseStudyModal(p) {
    if (!p) return;
    const modal = ensureCaseStudyModal();
    $("#csBadge", modal).textContent = `${p.category || 'Identity'} · ${p.tag || 'Brand'}`;
    $("#csYear", modal).textContent = p.year || new Date().getFullYear();
    $("#csTitle", modal).textContent = p.title || '';
    $("#csDesc", modal).textContent = p.description || '';
    $("#csClient", modal).textContent = p.client || 'Studio Client';

    const services = Array.isArray(p.services) ? p.services : [p.tag || 'Design'];
    $("#csServicesList", modal).innerHTML = services.map(s => `<span class="cs-service-pill">✦ ${esc(s)}</span>`).join("");

    const gallery = $("#csGallery", modal);
    const images = Array.isArray(p.images) && p.images.length ? p.images : [p.cover || p.thumbnail].filter(Boolean);

    gallery.innerHTML = images.map((img, i) => `
      <figure class="cs-image-card">
        <img src="${esc(safeUrl(img))}" alt="${esc(p.title)} presentation slide ${i + 1}" loading="lazy" decoding="async">
      </figure>
    `).join("");

    const behanceBtn = $("#csBehanceBtn", modal);
    if (p.behanceLink) {
      behanceBtn.href = safeUrl(p.behanceLink);
      behanceBtn.style.display = "inline-flex";
    } else if (cfg.social && cfg.social.behance) {
      behanceBtn.href = safeUrl(cfg.social.behance);
      behanceBtn.style.display = "inline-flex";
    } else {
      behanceBtn.style.display = "none";
    }

    const websiteBtn = $("#csWebsiteBtn", modal);
    if (p.websiteLink) {
      websiteBtn.href = safeUrl(p.websiteLink);
      websiteBtn.style.display = "inline-flex";
    } else {
      websiteBtn.style.display = "none";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const container = modal.querySelector(".cs-modal-container");
    if (container) container.scrollTop = 0;
  }

  function closeCaseStudyModal() {
    const modal = $("#caseStudyModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function bindGridInteraction(grid) {
    if (!grid || grid.dataset.boundClicks) return;
    grid.dataset.boundClicks = "true";

    grid.addEventListener("click", (event) => {
      const card = event.target.closest(".work-card");
      if (!card) return;
      event.preventDefault();
      const pId = card.dataset.projectId;
      const project = cfg.projects.find(p => String(p.id || p.title) === pId) || cfg.projects[0];
      if (project) openCaseStudyModal(project);
    });

    grid.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        const card = event.target.closest(".work-card");
        if (card) {
          event.preventDefault();
          card.click();
        }
      }
    });
  }

  /* ---------- homepage work showcase ---------- */
  function renderWorkPreview() {
    const grid = $("#work-preview-grid");
    if (!grid || window.SITE_PROJECTS_LOADING) return;
    const filterBar = $("#work-filters");
    grid.setAttribute("aria-busy", "false");
    if (window.SITE_PROJECTS_ERROR) {
      grid.innerHTML = `<p class="content-error" role="status">Project work could not be loaded. Please try again later.</p>`;
      if (filterBar) filterBar.hidden = true;
      return;
    }
    if (filterBar) filterBar.hidden = false;
    if (!cfg.projects.length) {
      grid.innerHTML = `<p class="content-error" role="status">Project work is being updated. Please check back soon.</p>`;
      return;
    }
    const categories = ["All", ...new Set(cfg.projects.map(p => p.category))];

    function draw(filter) {
      const items = filter === "All" ? cfg.projects : cfg.projects.filter(p => p.category === filter);
      grid.innerHTML = items.map(p => projectCard(p)).join("\n");
      if (window.applySiteLanguage) window.applySiteLanguage();
      if (window.observeReveals) window.observeReveals(Array.from(grid.querySelectorAll(".reveal")));
    }

    bindGridInteraction(grid);

    if (filterBar) {
      filterBar.innerHTML = categories.map((category, i) =>
        `<button type="button" class="filter-chip${i === 0 ? " active" : ""}" data-filter="${esc(category)}" aria-pressed="${i === 0}">${esc(category)}</button>`
      ).join("");
      filterBar.addEventListener("click", (event) => {
        const button = event.target.closest(".filter-chip");
        if (!button) return;
        filterBar.querySelectorAll(".filter-chip").forEach(chip => {
          const active = chip === button;
          chip.classList.toggle("active", active);
          chip.setAttribute("aria-pressed", String(active));
        });
        draw(button.dataset.filter);
      });
    }
    draw("All");
  }

  /* ---------- full work grid + filters (work.html) ---------- */
  function renderWorkFull() {
    const grid = $("#work-full-grid");
    if (!grid || window.SITE_PROJECTS_LOADING) return;
    const filterBar = $("#work-filters");
    grid.setAttribute("aria-busy", "false");
    if (window.SITE_PROJECTS_ERROR) {
      grid.innerHTML = `<p class="content-error" role="status">Project work could not be loaded. Please try again later.</p>`;
      if (filterBar) filterBar.hidden = true;
      return;
    }
    if (filterBar) filterBar.hidden = false;
    if (!cfg.projects.length) {
      grid.innerHTML = `<p class="content-error" role="status">Project work is being updated. Please check back soon.</p>`;
      return;
    }

    function draw(filter) {
      const items = filter && filter !== "All"
        ? cfg.projects.filter(p => p.category === filter)
        : cfg.projects;
      grid.innerHTML = items.map(p => projectCard(p)).join("\n");
    }

    bindGridInteraction(grid);
    draw();

    if (filterBar) {
      const categories = ["All", ...new Set(cfg.projects.map(p => p.category))];
      filterBar.innerHTML = categories.map((c, i) =>
        `<button type="button" class="filter-chip${i === 0 ? " active" : ""}" data-filter="${esc(c)}">${esc(c)}</button>`
      ).join("");
      filterBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-chip");
        if (!btn) return;
        $all(".filter-chip", filterBar).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        draw(btn.dataset.filter);
      });
    }
  }

  /* ---------- services preview (home) ---------- */
  function renderServicesPreview() {
    const list = $("#services-preview-list");
    if (!list) return;
    const serviceIcons = [
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3.5 8v8l8.5 5 8.5-5V8L12 3Z"/><path d="m3.5 8 8.5 5 8.5-5M12 13v8"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3v-12Z"/><path d="M8 19.5a3 3 0 0 1-3-3M9 9h6M9 13h6"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/></svg>`,
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h6v6h-6z"/></svg>`
    ];
    list.innerHTML = cfg.services.map((s, i) => `
      <div class="service-row reveal">
        <div class="service-num">${String(i + 1).padStart(2, "0")}</div>
        <h3><span>${esc(s.title)}</span><span class="service-icon" aria-hidden="true">${serviceIcons[i % serviceIcons.length]}</span></h3>
        <div class="service-description">
          <p>${esc(s.description)}</p>
          <ul class="service-deliverables">${s.deliverables.map(item => `<li>${esc(item)}</li>`).join("")}</ul>
        </div>
        <div class="service-tags">${s.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
      </div>`).join("\n");
  }

  /* ---------- services full detail (services.html) ---------- */
  function renderServicesFull() {
    const list = $("#services-detail-list");
    if (!list) return;
    list.innerHTML = cfg.services.map((s, i) => `
      <div class="service-detail reveal">
        <div>
          <div class="n">${String(i + 1).padStart(2, "0")}</div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
          <div class="service-tags">${s.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
        </div>
        <ul class="deliverables">
          ${s.deliverables.map(d => `<li>${esc(d)}</li>`).join("")}
        </ul>
      </div>`).join("\n");
  }

  /* ---------- stats (home about-teaser + about page) ---------- */
  function renderStats() {
    $all(".stat-row[data-config-stats]").forEach(row => {
      row.innerHTML = cfg.stats.map(s => `<div><strong data-counter="${esc(s.value)}">0</strong><span>${esc(s.label)}</span></div>`).join("\n");
    });
  }

  /* ---------- process steps (home + services) ---------- */
  function renderProcess() {
    $all("[data-config-process]").forEach(grid => {
      grid.innerHTML = cfg.process.map((step, i) => `
        <div class="process-step reveal">
          <div class="n">${String(i + 1).padStart(2, "0")}</div>
          <div><h3>${esc(step.title)}</h3><p>${esc(step.description)}</p></div>
        </div>`).join("\n");
    });
  }

  /* ---------- client types strip (home) ---------- */
  function renderClientTypes() {
    const el = $("#client-marks");
    if (!el) return;
    el.innerHTML = cfg.clientTypes.map(c => `<span>${esc(c)}</span>`).join("\n");
  }

  /* ---------- about teaser (home) + about page copy ---------- */
  function renderAboutTeaser() {
    const el = $("#about-teaser-copy");
    if (!el) return;
    el.querySelector(".avail-badge").innerHTML = `<span class="pulse"></span> ${esc(cfg.personal.availabilityBadge)}`;
    const paras = el.querySelectorAll("p");
    paras[0].innerHTML = `I'm <strong>${esc(cfg.personal.name)}</strong>, ${esc(cfg.personal.teaserBio)}`;
    if (paras[1]) paras[1].textContent = cfg.personal.longBioExtra;
    if (paras[2]) paras[2].textContent = cfg.personal.closingLine;
  }

  function renderAboutPage() {
    const bio = $("#about-bio");
    if (!bio) return;
    const paras = bio.querySelectorAll("p");
    if (paras[0]) paras[0].innerHTML = `I'm <strong>${esc(cfg.personal.name)}</strong>, ${esc(cfg.personal.longBioIntro)}`;
    if (paras[1]) paras[1].textContent = cfg.personal.longBioExtra;
    if (paras[2]) paras[2].textContent = cfg.personal.closingLine;

    const badge = $("#about-badge");
    if (badge) badge.innerHTML = `<span class="pulse"></span> ${esc(cfg.personal.availabilityBadge)}`;

    const heading = $("#about-hi-heading");
    if (heading) heading.textContent = `Hi, I'm ${cfg.personal.firstName}.`;

    const timeline = $("#experience-timeline");
    if (timeline) {
      timeline.innerHTML = cfg.experience.map((e, i) => `
        <div class="timeline-row reveal">
          <div class="yr">${String(i + 1).padStart(2, "0")}</div>
          <h3>${esc(e.role)}</h3>
          <p>${esc(e.company)}</p>
        </div>`).join("\n");
    }

    const values = $("#values-grid");
    if (values) {
      values.innerHTML = cfg.values.map(v => `
        <div class="value-card reveal">
          <h3>${esc(v.title)}</h3>
          <p>${esc(v.description)}</p>
        </div>`).join("\n");
    }
  }

  const SOCIAL_ICONS = {
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002ZM7 8.48H3V21h4V8.48Zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-3.96 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.68-2.91V8.48Z"/></svg>`,
    behance: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 10.5c1.3-.6 2-1.7 2-3.1 0-2.6-1.9-3.9-4.5-3.9H0v14.9h5.6c2.8 0 5.1-1.3 5.1-4.2 0-1.8-1-3.2-2.9-3.7Zm-4.9-4.6h2.6c1.1 0 2 .4 2 1.6 0 1.1-.8 1.7-2 1.7H2.9V5.9Zm2.9 9.9H2.9v-3.9h3c1.4 0 2.3.6 2.3 1.9 0 1.4-1 2-2.4 2ZM21.9 8h-6.4V6.4h6.4V8ZM24 14.2c0-3.2-1.9-5.6-5.2-5.6-3.2 0-5.4 2.3-5.4 5.5 0 3.3 2.1 5.5 5.5 5.5 2.4 0 4.3-1.1 5-3.1h-2.6c-.4.7-1.2 1.1-2.3 1.1-1.5 0-2.5-.9-2.7-2.5H24v-.9Zm-7.7-1.3c.3-1.3 1.2-2 2.5-2 1.2 0 2.1.8 2.3 2h-4.8Z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 5 5 .06 1.3.07 1.6.07 4.8 0 3.2 0 3.6-.07 4.8-.15 3.3-1.7 4.8-5 5-1.3.07-1.6.07-4.9.07-3.2 0-3.6 0-4.8-.07-3.3-.15-4.8-1.7-5-5C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.07-4.8.15-3.3 1.7-4.8 5-5C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-2.4.1-3.5 1.2-3.6 3.6C3.6 8.5 3.6 8.9 3.6 12c0 3.1 0 3.5.07 4.7.1 2.4 1.2 3.5 3.6 3.6 1.2.06 1.6.07 4.7.07 3.1 0 3.5 0 4.7-.07 2.4-.1 3.5-1.2 3.6-3.6.06-1.2.07-1.6.07-4.7 0-3.1 0-3.5-.07-4.7-.1-2.4-1.2-3.5-3.6-3.6C15.5 4 15.1 4 12 4Zm0 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm4.8-3.3a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16Z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.6 10.5 21 2h-2l-6.4 7.4L7.5 2H2l7.7 11.2L2 22h2l6.8-7.9L16.5 22H22l-8.4-11.5Zm-2.4 2.8-.8-1.1L4.1 3.4h2.7l5 7.2.8 1.1 6.6 9.4h-2.7l-5.3-7.6Z"/></svg>`,
    dribbble: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.6 4.6a8.3 8.3 0 0 1 1.8 5c-.3-.06-2.7-.55-5.2-.24-.06-.13-.1-.27-.16-.4-.16-.37-.33-.73-.5-1.08 2.7-1.1 3.9-2.7 4.08-3.28ZM12 3.7c1.9 0 3.7.7 5.1 1.9-.15.5-1.2 1.9-3.8 2.9-1.2-2.2-2.5-4-2.7-4.3.5-.3.9-.5 1.4-.5Zm-3.1.9c.2.3 1.5 2.1 2.7 4.2-3.4.9-6.4 1-6.7.9a8.4 8.4 0 0 1 4-5.1ZM3.7 12v-.3c.3 0 3.8.05 7.4-1.05.2.4.4.9.6 1.3l-.3.1c-3.8 1.2-5.8 4.6-6 4.8A8.3 8.3 0 0 1 3.7 12Zm8.3 8.3c-1.7 0-3.3-.6-4.6-1.6.1-.3 1.6-3.3 5.7-4.7h.1c1.1 3 1.5 5.5 1.6 6.1-.9.15-1.8.2-2.8.2Zm4.6-1c-.1-.4-.5-2.7-1.5-5.6 2.3-.35 4.4.24 4.6.3a8.4 8.4 0 0 1-3.1 5.3Z"/></svg>`,
    threads: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 11.2c-.1-4.4-2.6-6.9-6.9-7-3.7 0-6.3 1.7-6.7 5l2.3.2c.3-1.9 1.7-2.9 4.3-2.9 2.6 0 4.1 1.3 4.4 3.6-.7-.1-1.5-.2-2.4-.2-3.5 0-6.5 1.6-6.5 4.7 0 2.7 2.2 4.4 5.3 4.4 2.6 0 4.3-1.1 5.2-2.7.7 1 1 2.3 1 3.7h2.3c0-2.3-.6-4.1-1.9-5.5.4-.9.6-1.9.6-3.1Zm-6.6 6.6c-1.8 0-2.9-.8-2.9-2.1 0-1.6 1.7-2.5 4.1-2.5.8 0 1.5.06 2.2.2-.2 2.7-1.5 4.4-3.4 4.4Z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7C16.7 3.6 15.7 3.5 14.6 3.5c-2.4 0-4 1.5-4 4.2v2.2H8v3.1h2.6v8h2.9Z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4ZM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18.1c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 0 1 3.9 12c0-4.5 3.6-8.1 8.1-8.1s8.1 3.6 8.1 8.1-3.6 8.1-8.1 8.1Z"/></svg>`
  };

  /* ---------- contact section (home) ---------- */
  function renderContact() {
    const side = $("#contact-side");
    if (!side) return;

    const emailBlock = cfg.personal.email
      ? `<div class="block"><span>Email</span><a href="mailto:${esc(cfg.personal.email)}" id="contactEmailLink">${esc(cfg.personal.email)}</a> <button type="button" id="copyEmailBtn" class="copy-btn" aria-label="Copy email address">Copy</button></div>`
      : "";
    const websiteBlock = cfg.personal.website
      ? `<div class="block"><span>Portfolio</span><a href="https://${esc(cfg.personal.website)}" target="_blank" rel="noopener">${esc(cfg.personal.website)}</a></div>`
      : "";

    const socialEntries = Object.entries(cfg.social)
      .filter(([, url]) => url)
      .map(([key, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${key.charAt(0).toUpperCase() + key.slice(1)}" class="social-icon">${SOCIAL_ICONS[key] || ""}</a>`)
      .join("\n");

    side.innerHTML = `
      ${emailBlock}
      ${websiteBlock}
      <div class="block"><span>Elsewhere</span><div class="socials">${socialEntries}</div></div>
      ${cfg.social.whatsapp ? `<a class="whatsapp-contact" href="${esc(cfg.social.whatsapp)}" target="_blank" rel="noopener">
        <img src="${esc(cfg.personal.photo)}" alt="" loading="lazy">
        <span>Chat with Khizar on WhatsApp</span>
        <span class="whatsapp-contact-arrow" aria-hidden="true">↗</span>
      </a>` : ""}`;
  }

  /* ---------- testimonials (optional section) ---------- */
  function renderTestimonials() {
    const section = $("#testimonials-section");
    if (!section) return;
    if (!cfg.testimonials || cfg.testimonials.length === 0) {
      section.style.display = "none";
      return;
    }
    const grid = $("#testimonials-grid", section);
    grid.innerHTML = cfg.testimonials.map(t => {
      const initials = (t.company || t.name || "?").trim().charAt(0).toUpperCase();
      const avatar = t.photo
        ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy">`
        : `<div class="avatar-fallback">${esc(initials)}</div>`;
      return `
      <div class="testimonial-card reveal">
        ${avatar}
        <p>&ldquo;${esc(t.review)}&rdquo;</p>
        <strong>${esc(t.name)}</strong>
        <span>${esc(t.role)}${t.company ? ", " + esc(t.company) : ""}</span>
      </div>`;
    }).join("\n");
  }

  /* ---------- page-header (about/services/work) small helpers ---------- */
  function renderPageHeader() {
    const map = {
      about: { eyebrow: "About", h1: "Design that gives your brand permission to be confident.", lede: "Who I am, how I work, and who I build brands for." },
      services: { eyebrow: "Services", h1: "Four ways to work together.", lede: "Pick the right scope for where your business is today." },
      work: { eyebrow: "Selected Work", h1: "Identities built for businesses that mean it.", lede: "Logo systems, guidelines and packaging for founders who mean business." }
    };
    const data = map[page];
    const el = $("#page-header");
    if (!el || !data) return;
    el.querySelector(".eyebrow").textContent = data.eyebrow;
    el.querySelector("h1").textContent = data.h1;
    el.querySelector(".lede").textContent = data.lede;
  }

  /* ---------- generic [data-social-link] hookup ---------- */
  function renderSocialLinks() {
    $all("[data-social-link]").forEach(el => {
      const key = el.getAttribute("data-social-link");
      if (cfg.social[key]) el.href = cfg.social[key];
    });
  }

  /* ---------- FAQ accordion (home only) ---------- */
  function renderFAQ() {
    const list = $("#faq-list");
    if (!list || !cfg.faq) return;
    list.innerHTML = cfg.faq.map((item, i) => `
      <div class="faq-item reveal">
        <button type="button" class="faq-question" aria-expanded="false">
          <span>${esc(item.question)}</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer"><p>${esc(item.answer)}</p></div>
      </div>`).join("");
  }

  /* ---------- photo + about split section (home only) ---------- */
  function renderPhotoAbout() {
    const imgWrap = $("#photo-about-image");
    const copy = $("#photo-about-copy");
    if (!imgWrap || !copy) return;

    imgWrap.innerHTML = cfg.personal.photo
      ? `<img src="${esc(cfg.personal.photo)}" alt="${esc(cfg.personal.name)}" loading="lazy">`
      : `<div class="photo-placeholder">Photo needed — a professional three-quarter portrait, plain dark backdrop.<br>Set personal.photo in config.js to "assets/your-photo.jpg"</div>`;

    copy.querySelector("h2").textContent = cfg.personal.photoSectionHeading;
    copy.querySelector("p").textContent = cfg.personal.photoSectionBio;

    const socialsRow = $("#photo-about-socials", copy);
    if (socialsRow) {
      const keys = ["behance", "linkedin", "instagram", "twitter"];
      const labels = { behance: "Behance", linkedin: "LinkedIn", instagram: "Instagram", twitter: "X" };
      socialsRow.innerHTML = keys
        .filter(k => cfg.social[k])
        .map(k => `<a href="${esc(cfg.social[k])}" target="_blank" rel="noopener" aria-label="${labels[k]}">${SOCIAL_ICONS[k] || ""}<span>${labels[k]}</span></a>`)
        .join("\n");
    }
  }

  document.addEventListener("site-projects-ready", () => {
    if (page !== "home" && page !== "work") return;
    renderWorkPreview();
    renderWorkFull();
    if (window.observeReveals) window.observeReveals($all(".work-grid .reveal:not(.in)"));
    document.dispatchEvent(new CustomEvent("site-content-updated"));
  });

  /* ---------- run everything ---------- */
  applyTheme();
  applyFonts();
  applyMeta();
  renderNav();
  renderFooter();
  renderPageHeader();
  renderSocialLinks();

  if (page === "home") {
    renderHero();
    renderClientBrands();
    renderServicesMarquee();
    renderWorkPreview();
    renderServicesPreview();
    renderAboutTeaser();
    renderProcess();
    renderClientTypes();
    renderPhotoAbout();
    renderFAQ();
    renderContact();
  }
  if (page === "about") {
    renderAboutPage();
  }
  if (page === "services") {
    renderServicesFull();
    renderProcess();
  }
  if (page === "work") {
    renderWorkFull();
  }
  renderStats();
  renderTestimonials();

  // expose for main.js (counters, etc.)
  window.__renderedPage = page;
})();
