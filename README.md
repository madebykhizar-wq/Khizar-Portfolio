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

## Folder structure

```
index.html / about.html / services.html / work.html   → page shells (don't edit for content changes)
css/styles.css      → all visual styling (colors are CSS variables, driven by config.js at runtime)
js/config.js         ← EDIT THIS FILE for all content changes
js/render.js         → builds the page from config.js (no edit needed)
js/main.js            → interactive behavior: nav, dark mode, scroll progress, back-to-top, counters, filters
js/cursor.js          → the custom cursor effect
assets/                → logo, favicon, hero image go here
projects/<slug>/       → per-project thumbnail.jpg / cover.jpg go here
icons/, fonts/         → reserved for any icon or local font files you add later
```

## What's new since the last version

- **Config-driven content** — nav links, hero text, stats, services,
  projects, socials, SEO titles/descriptions, and colors/fonts all
  come from `config.js` and are rendered by JavaScript at page load.
- **Dark / light mode toggle** (top right of the nav) — remembers the
  visitor's choice.
- **Scroll progress bar** at the very top of the page.
- **Back-to-top button** (bottom right) — also fixes a bug in the old
  version where "Back to top" didn't actually work.
- **Active nav highlighting**, generated automatically per page.
- **Copy-email button** next to the email address in the contact section.
- **Animated stat counters** that count up when scrolled into view.
- **Project filters** on the Work page (by category).
- **Testimonials section** — hidden automatically until you add
  entries to `config.js`.

## Known limitation carried over from the original site

The contact form does **not** send anywhere — it's front-end only
(shows "Message received" on submit, but nothing is emailed). Since
this is a static site with no backend, wire it up to a service like
Formspree, Getform, or Netlify Forms before relying on it for real
inquiries.

## Local preview

From this folder, run:

```
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.
