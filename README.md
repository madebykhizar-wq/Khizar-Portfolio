# Khizar Hayat Portfolio — Config-Driven Build

## How to edit this site

You should only ever need to touch **one file**: `js/config.js`.

Open it and edit the values — your name, bio, email, social links,
colors, fonts, services, and every project card. Save, re-upload, done.
No HTML editing required.

To swap images, replace files inside `/assets` (logo, favicon) or
`/projects/<project-name>/` (thumbnails, covers), then point the
matching `thumbnail` / `cover` field in `config.js` at the new path.
Project images currently point to external Behance CDN URLs — you can
leave those as-is or switch any of them to a local file.

The public navigation is a single-page flow: Work, Services, and About
jump to sections on `index.html`. Every configured project is shown in
the homepage work grid, with category filters.

## Folder structure

```
index.html / about.html / services.html / work.html   → page shells (don't edit for content changes)
css/styles.css      → all visual styling (colors are CSS variables, driven by config.js at runtime)
js/config.js         ← EDIT THIS FILE for all content changes
js/render.js         → builds the page from config.js (no edit needed)
js/main.js            → interactive behavior: nav, language/theme controls, scroll progress, counters, filters, GSAP motion
js/cursor.js          → the custom cursor effect
js/vendor/            → locally hosted GSAP and ScrollTrigger files
assets/                → logo, favicon, hero image go here
projects/<slug>/       → per-project thumbnail.jpg / cover.jpg go here
icons/, fonts/         → reserved for any icon or local font files you add later
```

## Latest changes (this round)

- **Updated logo** — the supplied SVG mark is used in the nav and footer.
- **Single-page navigation** — Work, Services, and About scroll to their
  homepage sections; the selected-work section includes every project.
- **WhatsApp button** — moved into the fixed header beside the theme control.
- **Work thumbnails** — featured desktop card preserves the complete thumbnail;
  before/after comparison controls have been removed.
- **LinkedIn** — profile link points to `https://www.linkedin.com/in/madebykhizar/`.
- **Language switcher** — English, Spanish, French, and German controls
  translate navigation, section headings, and common interface labels
  locally. Project names and some long-form copy remain in their source
  language.
- **GSAP motion** — local GSAP and ScrollTrigger assets animate the hero
  and section headings. Animations are disabled for reduced-motion users.
- **Hero refresh** — the two-line desktop headline highlights its final
  phrase in green, with service chips, trust copy, and calls to action
  arranged in a compact layout over a subtle animated grid and wave.
- **Header and services** — the fixed header has a centered rounded
  section menu, and service rows use minimal green icons.
- **Favicon** — generated from your logo mark at all standard sizes
  (16px, 32px, and 180px for iOS home-screen icons). Already wired
  up in both `config.js` and each page's `<head>`.
- **Contact form now actually sends email** — wired to
  [FormSubmit.co](https://formsubmit.co), a free service that
  forwards form submissions straight to your inbox with no backend
  or account needed. **Important: the first time someone submits the
  form, FormSubmit will send `madebykhizar@gmail.com` a one-time
  confirmation email — you must click "Activate" in that email before
  submissions start arriving.** Do a test submission yourself first.
  If the request fails (e.g. no internet, or not yet activated), the
  visitor sees a message asking them to email you directly instead of
  a silent failure.
- **Email address updated** everywhere to `madebykhizar@gmail.com`.
- **Gradients & extra motion**, using only your existing palette
  (forest green / paper / ink — no new colors introduced):
  - Buttons now have a subtle gradient + light "shine" sweep on hover.
  - The refreshed hero uses a slow animated grid and low-opacity wave.
  - Project/service/process cards now fade in with a staggered
    delay instead of all at once, and have a soft colored glow on hover.
  - Nav links get an animated underline on hover/active.
- **New homepage section: photo + about**, right before the contact
  section — image on the left, short bio on the right. **You still
  need to add your photo** — drop it in `/assets` and set
  `personal.photo` in `config.js` to that path (see the note in
  `/assets`). Until then it shows a placeholder box so the layout
  still looks right.



- **Config-driven content** — nav links, hero text, stats, services,
  projects, socials, SEO titles/descriptions, and colors/fonts all
  come from `config.js` and are rendered by JavaScript at page load.
- **Dark / light mode toggle** (top right of the nav) — remembers the
  visitor's choice.
- **Scroll progress bar** at the very top of the page.
- **Back-to-top button** (bottom right) — also fixes a bug in the old
  version where "Back to top" didn't actually work.
- **Active nav highlighting** as visitors move between homepage sections.
- **Copy-email button** next to the email address in the contact section.
- **Animated stat counters** that count up when scrolled into view.
- **Project filters** on the Work page (by category).
- **Testimonials section** — hidden automatically until you add
  entries to `config.js`.

## Local preview

From this folder, run:

```
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.
