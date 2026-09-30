/* =========================================================
   SITE CONFIG
   ---------------------------------------------------------
   Edit this file for profile, service, FAQ, and design settings.
   Project entries live in content/projects.json and are managed
   with the authenticated editor under /admin/.

   Do NOT edit the .html files for routine content changes —
   they just render whatever is written here.
   ========================================================= */

window.SITE_CONFIG = {

  // ===========================================================
  // SUPABASE DATABASE INTEGRATION
  // ===========================================================
  supabase: {
    url: "https://ahmmjhubfwhazewptrad.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobW1qaHViZndoYXpld3B0cmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2OTA2MjAsImV4cCI6MjEwNjI2NjYyMH0.HE07tBLITbk_jSIpejeDolsLEb94_u9SsI6TGijIm0I"
  },

  // ===========================================================
  // BRAND — logo, favicon, site-wide title
  // ===========================================================
  brand: {
    // Shown in the nav if logoImage is empty. Keep the "." — it's styled by CSS.
    logoText: "MadebyKhizar",
    // Real logo mark — used in the nav and footer
    logoImage: "assets/logo.svg",
    // Shown on hover over the nav logo, and in the footer next to the logo.
    madeBy: "KHIZAR HAYAT",
    favicon: "assets/favicon-48.png",
    faviconSvg: "assets/logo.svg",
    favicon96: "assets/favicon-96.png",
    favicon192: "assets/favicon-192.png",
    faviconSmall: "assets/favicon-32.png",
    appleTouchIcon: "assets/favicon-180.png",
    siteTitle: "Khizar Hayat | Made by Khizar — Brand Identity & Packaging Designer"
  },

  // ===========================================================
  // COLORS — every color on the site comes from here.
  // Changing a value updates the whole site immediately (light
  // mode). Dark mode remaps these same roles — see the
  // html[data-theme="dark"] block in css/styles.css.
  //
  // Brand system: white / near-black text ~60% (base), muted
  // green ~20-25% (CTAs, links, active states, badge dot),
  // pale green tint used sparingly for hover/highlight fills.
  // ===========================================================
  colors: {
    primary:   "#1E7A4C", // muted green — primary CTAs, buttons, cursor, links, active states
    secondary: "#1E7A4C", // same muted green — single-accent palette
    accent:    "#1E7A4C", // same muted green — badge dot / pulse / active-state accents
    background:"#FFFFFF", // white — main page background (light mode)
    backgroundAlt: "#F4F6F5", // pale green-grey — alternating section background (FAQ/about)
    text:      "#12100D", // near-black — headings & primary text
    textSoft:  "#6B7069", // muted secondary/caption text
    dark:      "#0B1F17"  // near-black green-tinted charcoal — footer / CTA band / dark sections
  },

  // ===========================================================
  // TYPOGRAPHY
  // ===========================================================
  typography: {
    headingFont: "'Bricolage Grotesque', sans-serif",
    bodyFont: "'Inter', sans-serif",
    // kept as an alias to bodyFont — the site now uses only Bricolage Grotesque + Inter
    monoFont: "'Inter', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@400;500;600;700&display=swap"
  },

  // ===========================================================
  // PERSONAL INFO
  // ===========================================================
  personal: {
    name: "Khizar Hayat",
    firstName: "Khizar",
    title: "Brand Identity & Packaging Designer",
    location: "Gujranwala, Pakistan",
    workingWith: "US · UK · Middle East",
    focus: "Startups & product businesses",
    availabilityNote: "Freelance & select retainers",
    availabilityBadge: "Available for Freelance & Full-time",
    shortBio: "I design strategic logos, visual identities, and packaging that make your business look professional, memorable, and trusted.",
    // teaserBio: short version shown on the homepage About teaser
    teaserBio: "a brand identity and packaging designer helping founders build brands with clarity and confidence.",
    // longBioIntro is the sentence that follows "I'm <Name>, " on the About page — don't repeat the name here
    longBioIntro: "a brand identity and packaging designer based in Gujranwala, Pakistan, working with founders internationally.",
    longBioExtra: "I help startups and product businesses build memorable brands — from first sketch to final files.",
    closingLine: "If your brand still feels undecided, that's usually where we start.",
    email: "madebykhizar@gmail.com",
    phone: "+923420255825",
    whatsapp: "+923420255825",
    website: "madebykhizar.com",
    // Path to a portrait photo for the homepage photo+about section.
    // Leave empty until you upload one — a placeholder will show instead.
    photo: "assets/my-photo.jpg",
    photoSectionHeading: "The person behind the brand.",
    photoSectionBio: "I'm Khizar — a brand identity and packaging designer based in Gujranwala, Pakistan. I've spent the last 6+ years helping founders turn undecided brands into confident ones.",
  },

  // ===========================================================
  // SOCIAL LINKS — leave any field empty ("") to hide that icon/link
  // ===========================================================
  social: {
    behance: "https://www.behance.net/gdkhizarhayat",
    linkedin: "https://www.linkedin.com/in/madebykhizar/",
    instagram: "https://instagram.com/madebykhizar",
    twitter: "https://twitter.com/madebykhizar",
    whatsapp: "https://wa.link/kg29k3",
    dribbble: "",
    threads: "https://www.threads.com/@madebykhizar?hl=en",
    facebook: "https://www.facebook.com/gdkhizarhayat"
  },

  // ===========================================================
  // RESUME
  // ===========================================================
  resume: {
    url: "assets/khizar-hayat-resume.pdf" // e.g. "assets/khizar-hayat-resume.pdf" — leave empty to hide the button
  },

  // ===========================================================
  // PRIMARY CTA (used in the hero button)
  // ===========================================================
  cta: {
    text: "Book a Free Discovery Call",
    // External links (http/https) automatically open in a new tab.
    link: "https://calendly.com/khizarhayat/30min"
  },

  // Text shown on the small nav button (top right of every page)
  navCtaText: "Start a Project",

  // ===========================================================
  // HERO SECTION (homepage)
  // ===========================================================
  hero: {
    eyebrow: "Brand Identity & Packaging Design",
    headline: "Helping Brands Look Premium,<br>Clear & <em>Memorable.</em>",
    // Hero-only badge — deliberately separate from personal.availabilityBadge
    // (which still says "Available for Freelance & Full-time" on the About
    // page). Edit this line any time you want to change the trust signal.
    badge: "Trusted by 25+ brands worldwide",
    // Service labels shown above the hero headline. Each needs an icon key
    // (star / target / calendar / package — see ICONS in render.js) and
    // a label. Add/remove entries freely; the row wraps automatically.
    chips: [
      { icon: "target", label: "Brand Identity" },
      { icon: "package", label: "Packaging Design" },
      { icon: "star",    label: "Visual Systems" }
    ]
  },

  // ===========================================================
  // STATS (used on homepage About teaser + About page)
  // ===========================================================
  stats: [
    { value: "6+",   label: "Years Experience" },
    { value: "450+", label: "Packaging Designs" },
    { value: "25+",  label: "Brand Identities" },
    { value: "3",    label: "Regions Served" }
  ],

  // ===========================================================
  // MARQUEE STRIP (homepage scrolling ticker)
  // ===========================================================
  marquee: [
    "Brand Identity", "Logo Systems", "Packaging Design",
    "Brand Guidelines", "Visual Strategy", "Social & Collateral"
  ],

  // ===========================================================
  // CLIENT / BRAND MARQUEE (homepage — logo-style scrolling strip)
  //
  // LOGO OPTIONS (choose one per client):
  //
  //  1. logoImage: "assets/clients/hyundai.png"
  //     → Real logo file aap ne upload kiya. PNG/SVG dono chalte hain.
  //       Sirf file ko assets/clients/ folder mein rakho aur path yahan likho.
  //       agar logoImage dein to SVG icon automatically ignore hoga.
  //
  //  2. logo: "hyundai"   (bina logoImage ke)
  //     → Built-in placeholder SVG icon use hoga (old style, as shown in screenshot)
  //
  //  3. Dono blank rakho
  //     → Sirf naam show hoga, koi icon nahi (clean minimal look)
  //
  // ===========================================================
  clientBrands: [
    { name: "Hyundai",        sub: "Gujranwala",       logo: "hyundai",  logoImage: "" },
    { name: "Suzuki",         sub: "Motors",            logo: "suzuki",   logoImage: "" },
    { name: "Go Petroleum",   sub: "Oil & Energy",      logo: "go",       logoImage: "" },
    { name: "Pakson Boss",    sub: "International",     logo: "boss",     logoImage: "" },
    { name: "GFI JOJO",      sub: "Food Industries",   logo: "jojo",     logoImage: "" },
    { name: "Bioxy S.L.",    sub: "Health & Wellness",  logo: "bioxy",    logoImage: "" },
    { name: "Synvora®",      sub: "Tech & AI",          logo: "synvora",  logoImage: "" },
    { name: "Burger Station", sub: "Food & Dining",     logo: "burger",   logoImage: "" },
    { name: "Move Energy",    sub: "Beverages",         logo: "move",     logoImage: "" },
    { name: "Wheels & Zameen",sub: "Auto & Property",  logo: "wheels",   logoImage: "" },
    { name: "Wirsa Restaurant",sub: "Authentic Dining", logo: "wirsa",   logoImage: "" }
  ],

  // ===========================================================
  // SERVICES — shown as a short list on the homepage and in full
  // details in the homepage Services section. Add/remove/edit freely.
  // ===========================================================
  services: [
    {
      title: "Logo & Identity",
      description: "A logo system and visual language built to work everywhere your brand shows up.",
      tags: ["Logo", "Colour", "Type", "Iconography"],
      deliverables: [
        "Primary logo + secondary marks & favicon",
        "Colour palette & typography system",
        "Supporting iconography & graphic elements",
        "Source files (AI, EPS, SVG, PNG)"
      ]
    },
    {
      title: "Brand Guidelines",
      description: "A complete brand book so your team never has to guess how the brand should look.",
      tags: ["Guidelines", "Assets", "Handoff"],
      deliverables: [
        "Logo usage rules & clear space guidance",
        "Colour, type & imagery standards",
        "Voice & tone notes for brand copy",
        "Packaged asset library for your team"
      ]
    },
    {
      title: "Packaging Design",
      description: "Shelf-ready packaging systems, built to hold up at production scale.",
      tags: ["Structure", "Print", "Artwork"],
      deliverables: [
        "Packaging structure & dieline setup",
        "Print-ready artwork per SKU",
        "Label & material recommendations",
        "Production-file handoff & proofing support"
      ]
    },
    {
      title: "Brand Collateral",
      description: "Social templates and marketing collateral that keep everything on-brand.",
      tags: ["Social", "Decks", "Templates"],
      deliverables: [
        "Social media templates & post kits",
        "Pitch deck & presentation templates",
        "Email & document templates",
        "Editable source files for your team"
      ]
    }
  ],

  // Project entries are loaded from content/projects.json so they can
  // be managed through the authenticated GitHub CMS.
  projects: [],

  // ===========================================================
  // TESTIMONIALS — add client-approved quotes to show the section.
  // Leave empty until you have real quotes and permission to publish.
  // ===========================================================
  testimonials: [],

  // ===========================================================
  // PROCESS (How We'd Work — shown on homepage & services page)
  // ===========================================================
  process: [
    { title: "Discovery", description: "Understanding your business and where the brand falls short." },
    { title: "Planning", description: "Direction agreed before a single pixel is designed." },
    { title: "Design",    description: "Concepts and a focused round of refinement." },
    { title: "Handoff",   description: "Final files and guidelines, ready to use." }
  ],

  // ===========================================================
  // EXPERIENCE TIMELINE (About page)
  // ===========================================================
  experience: [
    { role: "Brand Designer",   company: "Pistowl Digital — Gujranwala, Pakistan" },
    { role: "Graphic Designer", company: "GFI JOJO — Gujranwala, Pakistan" },
    { role: "Graphic Designer", company: "Pakson International Boss — Gujranwala, Pakistan" }
  ],

  // ===========================================================
  // VALUES ("How I Work" cards on About page)
  // ===========================================================
  values: [
    { title: "Strategy first", description: "Direction agreed before a single pixel is designed." },
    { title: "Built to last",  description: "Systems, not one-off marks — designed to grow with you." },
    { title: "Clear handoff",  description: "Files and guidelines your team can actually use." }
  ],

  // ===========================================================
  // CLIENT TYPES STRIP (homepage)
  // ===========================================================
  clientTypes: [
    "Startups", "DTC & Product Brands", "Health & Wellness",
    "Tech & AI", "Consumer Goods", "Founders & Coaches"
  ],

  // ===========================================================
  // FAQ — shown as an accordion on the homepage.
  // ===========================================================
  faq: [
    { question: "How long does a project take?", answer: "Most logo and identity projects take 2–3 weeks. Packaging and full brand guideline projects usually run 3–5 weeks, depending on scope and revision rounds." },
    { question: "What's included in a brand identity package?", answer: "A primary logo with secondary marks, a colour and typography system, supporting iconography, and source files in AI, EPS, SVG and PNG, plus guidelines on how to use it all." },
    { question: "Can you build an identity around my existing logo?", answer: "Yes. We can keep a logo that still fits your business and develop the supporting colours, typography, graphic elements and usage guidelines around it." },
    { question: "What do you need from me before starting an identity project?", answer: "A short discussion about your business, audience, goals and preferences gives us a clear starting point. I will share a proposal with the agreed scope before design begins." },
    { question: "Can you design packaging for a product range?", answer: "Yes. Packaging projects can cover the visual direction and label or packaging layouts for the agreed products. The exact formats, deliverables and print requirements are confirmed in the proposal." },
    { question: "Will the packaging files be ready for my printer?", answer: "Print-ready artwork can be included when it is part of the agreed scope. Share your printer's dielines and production specifications so they can be accounted for before final files are prepared." },
    { question: "How many revisions do I get?", answer: "Every package includes a set number of focused revision rounds, agreed before we start. Strategy gets locked in early so revisions stay small and fast, not a redesign from scratch." },
    { question: "Do you work with clients outside Pakistan?", answer: "Yes — most of my clients are based in the US, UK and Middle East. All communication, files and calls are handled remotely." },
    { question: "How do we get started?", answer: "Book a discovery call or send a message through the contact form. We'll talk through your brand, timeline and budget, and I'll follow up with a proposal." }
  ],

  // ===========================================================
  // NAVIGATION
  // ===========================================================
  nav: [
    { label: "Work", href: "#work", key: "work" },
    { label: "Services", href: "#services", key: "services" },
    { label: "About me", href: "#about", key: "about" }
  ],

  // ===========================================================
  // SEO — per-page title & description. "home" / "about" /
  // "services" / "work" match each page's data-page attribute.
  // ===========================================================
  seo: {
    ogImage: "",
    pages: {
      home: {
        title: "Khizar Hayat | Made by Khizar — Brand Identity & Packaging Designer",
        description: "Khizar Hayat (Made by Khizar) is a brand identity and packaging designer helping startups and product businesses build clear, memorable brands."
      },
      about: {
        title: "About Khizar Hayat | Made by Khizar — Brand & Packaging Designer",
        description: "Learn about Khizar Hayat (Made by Khizar), a brand identity and packaging designer based in Gujranwala, Pakistan, working with founders internationally."
      },
      services: {
        title: "Brand & Packaging Design Services | Made by Khizar",
        description: "Explore brand identity, logo systems, packaging design, guidelines and brand collateral services by Khizar Hayat (Made by Khizar)."
      },
      work: {
        title: "Selected Work | Made by Khizar — Brand & Packaging Portfolio",
        description: "Browse selected brand identity, logo systems and packaging design projects by Khizar Hayat (Made by Khizar)."
      }
    }
  },

  // ===========================================================
  // FOOTER
  // ===========================================================
  footer: {
    copyrightYear: "2026",
    copyrightName: "Khizar Hayat. All rights reserved."
  }
};
