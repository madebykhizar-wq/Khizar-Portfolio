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
    const root = document.documentElement.style;
    const c = cfg.colors || {};
    root.setProperty("--white", c.background);
    root.setProperty("--paper", c.backgroundAlt);
    root.setProperty("--ink", c.text);
    root.setProperty("--ink-2", c.dark);
    root.setProperty("--sage", c.secondary);
    root.setProperty("--forest", c.primary);
    root.setProperty("--text-soft", c.textSoft);

    const t = cfg.typography || {};
    root.setProperty("--font-heading", t.headingFont);
    root.setProperty("--font-body", t.bodyFont);
    root.setProperty("--font-mono", t.monoFont);

    document.body.style.fontFamily = "var(--font-body)";
  }

  /* ---------- favicon / title / meta ---------- */
  function applyMeta() {
    if (cfg.brand && cfg.brand.favicon) {
      let link = $('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = cfg.brand.favicon;
    }
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

    const logoHtml = cfg.brand.logoImage
      ? `<img src="${esc(cfg.brand.logoImage)}" alt="${esc(cfg.personal.name)}" class="logo-img">`
      : (() => {
          const parts = cfg.brand.logoText.split(".");
          return `${esc(parts[0])}<span>.</span>${esc(parts.slice(1).join("."))}`;
        })();

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
    footer.innerHTML = `
      <span>© ${esc(cfg.footer.copyrightYear)} ${esc(cfg.footer.copyrightName)}</span>
      <span><a href="${backHref}" id="footerBackLink">${backLabel}</a></span>`;
  }

  /* ---------- hero (home only) ---------- */
  function renderHero() {
    const el = $("#hero-content");
    if (!el) return;
    el.querySelector(".eyebrow").textContent = cfg.hero.eyebrow;
    el.querySelector("h1").innerHTML = cfg.hero.headline;
    el.querySelector(".hero-side p").textContent = cfg.personal.shortBio;
    const cta = el.querySelector(".hero-side .btn");
    cta.href = cfg.cta.link;
    cta.innerHTML = `${esc(cfg.cta.text)} <span class="arrow">→</span>`;

    const meta = $("#hero-meta");
    meta.innerHTML = `
      <div>Based in<strong>${esc(cfg.personal.location)}</strong></div>
      <div>Working with clients in<strong>${esc(cfg.personal.workingWith)}</strong></div>
      <div>Focus<strong>${esc(cfg.personal.focus)}</strong></div>
      <div>Available for<strong>${esc(cfg.personal.availabilityNote)}</strong></div>`;
  }

  /* ---------- marquee ---------- */
  function renderMarquee() {
    const el = $("#marquee-track");
    if (!el) return;
    const items = cfg.marquee.map(m => `<span class="dot">${esc(m)}</span>`).join("");
    el.innerHTML = items + items; // duplicated for seamless loop
  }

  /* ---------- project card markup ---------- */
  function projectCard(p, tagOverride) {
    return `
      <a class="work-card${p.featured ? " feature" : ""}" href="${esc(p.behanceLink || p.websiteLink || "#")}" target="_blank" rel="noopener">
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
      <div class="service-row">
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
      <div class="service-detail">
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
        <div class="process-step">
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
    paras[0].innerHTML = `I'm <strong>${esc(cfg.personal.name)}</strong>, ${esc(cfg.personal.longBioIntro)}`;
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
        <div class="timeline-row">
          <div class="yr">${String(i + 1).padStart(2, "0")}</div>
          <h3>${esc(e.role)}</h3>
          <p>${esc(e.company)}</p>
        </div>`).join("\n");
    }

    const values = $("#values-grid");
    if (values) {
      values.innerHTML = cfg.values.map(v => `
        <div class="value-card">
          <h3>${esc(v.title)}</h3>
          <p>${esc(v.description)}</p>
        </div>`).join("\n");
    }
  }

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
      .map(([key, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`)
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
      <div class="testimonial-card">
        ${t.photo ? `<img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy">` : ""}
        <p>&ldquo;${esc(t.review)}&rdquo;</p>
        <strong>${esc(t.name)}</strong>
        <span>${esc(t.role)}${t.company ? ", " + esc(t.company) : ""}</span>
      </div>`).join("\n");
  }

  /* ---------- page-header (about/services/work) small helpers ---------- */
  function renderPageHeader() {
    const map = {
      about: { eyebrow: "About", h1: "Design that gives your brand permission to be confident.", lede: "A closer look at who I am, how I work, and the kind of businesses I build brands for." },
      services: { eyebrow: "Services", h1: "Four ways to work together.", lede: "Every engagement starts with the same question: what does this brand need to say, and to whom. From there, we pick the right scope for where your business actually is." },
      work: { eyebrow: "Selected Work", h1: "Identities built for businesses that mean it.", lede: "Logo systems, brand guidelines, packaging and social systems for startups, health & wellness brands, tech companies and product businesses." }
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
    renderWorkPreview();
    renderServicesPreview();
    renderAboutTeaser();
    renderProcess();
    renderClientTypes();
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
