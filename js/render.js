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
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
  function applyMeta() {
    const brand = cfg.brand || {};
    function setIconLink(rel, href, sizes) {
      if (!href) return;
      let sel = sizes ? `link[rel="${rel}"][sizes="${sizes}"]` : `link[rel="${rel}"]`;
      let link = $(sel);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        document.head.appendChild(link);
      }
      link.href = href;
    }
    setIconLink("icon", brand.favicon, "32x32");
    setIconLink("icon", brand.faviconSmall, "16x16");
    setIconLink("apple-touch-icon", brand.appleTouchIcon);

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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cfg.typography.googleFontsUrl;
      document.head.appendChild(link);
    }
  }

  /* ---------- header / nav (shared across every page) ---------- */
  function renderNav() {
    const nav = $("#site-nav");
    if (!nav) return;

    const wordmark = (() => {
      const parts = cfg.brand.logoText.split(".");
      return `${esc(parts[0])}<span>.</span>${esc(parts.slice(1).join("."))}`;
    })();
    const iconHtml = cfg.brand.logoImage
      ? `<img src="${esc(cfg.brand.logoImage)}" alt="" class="logo-img">`
      : "";
    const revealHtml = cfg.brand.madeBy
      ? `<span class="logo-reveal">${esc(cfg.brand.madeBy)}</span>`
      : "";
    const logoHtml = iconHtml + wordmark + revealHtml;

    const homeHref = page === "home" ? "index.html" : "index.html";
    const contactHref = page === "home" ? "#contact" : "index.html#contact";

    const links = cfg.nav.map(item => {
      const isActive = page === item.key ? " active" : "";
      return `<a href="${esc(item.href)}" class="${isActive.trim()}">${esc(item.label)}</a>`;
    }).join("\n");

    nav.innerHTML = `
      <a href="${homeHref}" class="logo">${logoHtml}</a>
      <button class="navtoggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">Menu</button>
      <div class="navlinks" id="navLinks">
        ${links}
        <a href="${contactHref}" class="cta">${esc(cfg.navCtaText || "Start a Project")}</a>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" type="button">🌙</button>
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
      <span><a href="${backHref}" id="footerBackLink">${backLabel}</a></span>`;
  }

  /* ---------- hero (home only) ---------- */
  function renderHero() {
    const el = $("#hero-content");
    if (!el) return;

    const badge = $("#hero-badge");
    badge.querySelector("span:last-child").textContent = cfg.personal.availabilityBadge;

    el.querySelector("h1").innerHTML = cfg.hero.headline;
    el.querySelector(".hero-side p").innerHTML = cfg.personal.shortBio;

    const cta = el.querySelector(".hero-cta");
    cta.href = cfg.cta.link;
    cta.querySelector(".btn-text").textContent = cfg.cta.text;
    if (/^https?:\/\//i.test(cfg.cta.link)) {
      cta.target = "_blank";
      cta.rel = "noopener";
    }

    const iconStar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>`;
    const iconTarget = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>`;
    const iconCalendar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8.5 15l2 2 4-4"/></svg>`;

    const chips = [
      { icon: iconStar, label: cfg.stats[0] ? `${cfg.stats[0].value} ${cfg.stats[0].label}` : "" },
      { icon: iconTarget, label: cfg.personal.focus },
      { icon: iconCalendar, label: cfg.personal.availabilityNote }
    ];
    $("#hero-chips").innerHTML = chips.map(c => `
      <div class="hero-chip"><span class="chip-icon">${c.icon}</span><span>${esc(c.label)}</span></div>`).join("");
  }

  /* ---------- marquee ---------- */
  function renderMarquee() {
    const el = $("#marquee-track");
    if (!el) return;
    const items = cfg.marquee.map(m => `<span class="dot">${esc(m)}</span>`).join("");
    el.innerHTML = items + items; // duplicated for seamless loop
  }

  /* ---------- client / brand logo marquee ---------- */
  function renderClientBrandMarquee() {
    const el = $("#brand-marquee-track");
    if (!el || !cfg.clientBrands) return;
    const items = cfg.clientBrands.map(b => `<span class="brand-chip">${esc(b)}</span>`).join("");
    el.innerHTML = items + items; // duplicated for seamless loop
  }

  /* ---------- project card markup ---------- */
  function projectCard(p, tagOverride) {
    return `
      <a class="work-card reveal${p.featured ? " feature" : ""}" href="${esc(p.behanceLink || p.websiteLink || "#")}" target="_blank" rel="noopener">
        <span class="work-tag">${esc(tagOverride || p.cardLabel)}</span>
        <img src="${esc(p.thumbnail)}" alt="${esc(p.title)}" loading="lazy">
        <div class="work-overlay">
          <div class="cat">${esc(p.category)} — ${esc(p.tag)}</div>
          <h3>${esc(p.title)}</h3>
          <span class="go">View case study ↗</span>
        </div>
      </a>`;
  }

  /* ---------- homepage work preview (first 3 projects) ---------- */
  function renderWorkPreview() {
    const grid = $("#work-preview-grid");
    if (!grid) return;
    // Uses each project's `homepageOrder` field to decide what shows on the
    // homepage preview (and in what order) — independent from the full
    // work-page order. Projects without homepageOrder are skipped here.
    const items = cfg.projects
      .filter(p => p.homepageOrder)
      .sort((a, b) => a.homepageOrder - b.homepageOrder)
      .slice(0, 3);
    grid.innerHTML = items.map((p, i) => projectCard(p, i === 0 ? p.cardLabel : String(i + 1).padStart(2, "0"))).join("\n");
  }

  /* ---------- full work grid + filters (work.html) ---------- */
  function renderWorkFull() {
    const grid = $("#work-full-grid");
    if (!grid) return;

    function draw(filter) {
      const items = filter && filter !== "All"
        ? cfg.projects.filter(p => p.category === filter)
        : cfg.projects;
      grid.innerHTML = items.map(p => projectCard(p)).join("\n");
    }
    draw();

    const filterBar = $("#work-filters");
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
    list.innerHTML = cfg.services.map((s, i) => `
      <div class="service-row reveal">
        <div class="service-num">${String(i + 1).padStart(2, "0")}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
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
      <div class="block"><span>Elsewhere</span><div class="socials">${socialEntries}</div></div>`;
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
    grid.innerHTML = cfg.testimonials.map(t => `
      <div class="testimonial-card reveal">
        ${t.photo ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy">` : ""}
        <p>&ldquo;${esc(t.review)}&rdquo;</p>
        <strong>${esc(t.name)}</strong>
        <span>${esc(t.role)}${t.company ? ", " + esc(t.company) : ""}</span>
      </div>`).join("\n");
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
      : `<div class="photo-placeholder">Add your photo — set personal.photo in config.js to<br>"assets/your-photo.jpg"</div>`;

    copy.querySelector("h2").textContent = cfg.personal.photoSectionHeading;
    copy.querySelector("p").textContent = cfg.personal.photoSectionBio;
  }

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
    renderMarquee();
    renderClientBrandMarquee();
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
