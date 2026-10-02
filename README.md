# Khizar Hayat Portfolio — Config-Driven Build

## How to edit this site

Most portfolio text and settings live in `js/config.js`. Projects and
project images can be updated through the authenticated editor at
`/admin/` after its OAuth service has been configured.

Open it and edit the values — your name, bio, email, social links,
colors, fonts, services and FAQs. The project editor stores entries in
`content/projects.json` and uploads images to `assets/projects/`.

To edit projects in the editor, sign in, update or add an entry, then
save it for editorial review. The editor opens a GitHub pull request;
merge that change into `main` to publish it through the existing site
deployment. The public project grid reads `content/projects.json`.

Projects can also include optional editorial case-study sections with
headings, text, images, and MP4/WebM videos. Portfolio Studio controls each
section's text styling, background, image fit, columns, and spacing. Uploaded
videos must be smaller than 5 MB each. Add only approved client testimonials;
related projects can be selected manually or suggested automatically. Save
project details and use GitHub Sync to publish these fields in
`content/projects.json`. Projects without editorial sections retain their
current gallery presentation.

Google Analytics is loaded only after a visitor accepts optional analytics
in the cookie banner. Visitors can reject analytics or reopen Cookie settings
to change their choice.

The public navigation is a single-page flow: Work, Services, and About
jump to sections on `index.html`. Every configured project is shown in
the homepage work grid, with category filters.

## Configure the project editor

The static site cannot safely store a GitHub OAuth client secret. Before
`/admin/` can sign in, deploy a trusted GitHub OAuth broker and replace
the example `backend.base_url` in `admin/config.yml` with that broker's
HTTPS origin. Register the broker's callback URL in a GitHub OAuth App,
keep its client secret in the broker's server-side environment, and
restrict authorization to the portfolio repository and trusted editors.
Never put OAuth secrets, access tokens, or private keys in this repository.

The editor uses the GitHub backend with editorial workflow enabled.
Editors' project changes are proposed for review instead of publishing
directly to the live branch. The rest of the site can be previewed locally
with `python -m http.server 8000`; `/admin/` sign-in requires the deployed
OAuth broker and GitHub configuration.

Privacy, terms, and refund pages are initial drafts, not legal advice.
Review them for accuracy and obtain any professional advice you need before
publishing them as final policies.

## Folder structure

```
index.html / about.html / services.html / work.html   → page shells (don't edit for content changes)
css/styles.css      → all visual styling (colors are CSS variables, driven by config.js at runtime)
js/config.js         ← edit site profile, services, FAQs, and design settings
content/projects.json → project entries managed by the admin editor
admin/                → GitHub-backed editorial CMS
js/render.js         → builds the page from config and project content
js/projects-loader.js → loads project data and reports load errors
js/main.js            → nav, language/theme controls, scroll progress, counters, filters, motion
js/cursor.js          → the custom cursor effect
js/vendor/            → locally hosted GSAP and ScrollTrigger files
assets/                → logo, favicon, hero image go here
assets/projects/       → project images uploaded in the editor
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
- **Homepage motion and proof** — client names move in a single,
  pausable ticker. Unapproved sample testimonials are removed and the
  section stays hidden until you add real, approved quotes in `config.js`.
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
- **Turnstile is not enabled yet.** The form currently posts directly
  from the browser to FormSubmit, and this repository is deployed via
  GitHub Pages. A browser-only Turnstile check would be bypassable
  because its token must be verified server-side. Keep the existing
  form flow until a server-side endpoint and compatible deployment are
  in place; never put a Turnstile secret in frontend code.
- **Email address updated** everywhere to `madebykhizar@gmail.com`.
- **Gradients & extra motion**, using only your existing palette
  (forest green / paper / ink — no new colors introduced):
  - Buttons now have a subtle gradient + light "shine" sweep on hover.
  - The refreshed hero uses a slow animated grid and low-opacity wave.
  - Project/service/process cards now fade in with a staggered
    delay instead of all at once, and have a soft colored glow on hover.
  - Nav links get an animated underline on hover/active.
- **New homepage section: photo + about**, right before the contact
  section — image on the left, short bio on the right. The portrait
  image is `assets/my-photo.jpg`, configured through `personal.photo`.



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
