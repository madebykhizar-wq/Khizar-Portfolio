/* =========================================================
   SITE CONFIG
   ---------------------------------------------------------
   This is the ONLY file you should need to edit to update
   the portfolio. Change text here, replace images in
   /assets and /projects, and the whole site updates itself.

   Do NOT edit the .html files for routine content changes —
   they just render whatever is written here.
   ========================================================= */

window.SITE_CONFIG = {

  // ===========================================================
  // BRAND — logo, favicon, site-wide title
  // ===========================================================
  brand: {
    // Shown in the nav if logoImage is empty. Keep the "." — it's styled by CSS.
    logoText: "KHIZAR.HAYAT",
    // Real logo mark — used in the nav and footer
    logoImage: "assets/logo.svg",
    // Shown on hover over the nav logo, and in the footer next to the logo.
    madeBy: "MADE BY KHIZAR",
    favicon: "assets/favicon-32.png",
    faviconSmall: "assets/favicon-16.png",
    appleTouchIcon: "assets/favicon-180.png",
    siteTitle: "Khizar Hayat — Brand Identity & Packaging Designer"
  },

  // ===========================================================
  // COLORS — every color on the site comes from here.
  // Changing a value updates the whole site immediately (light
  // mode). Dark mode remaps these same roles — see the
  // html[data-theme="dark"] block in css/styles.css.
  //
  // Brand system: onyx/white ~60% (base), coral ~20% (primary
  // CTAs), dusty denim ~15% (secondary/links/icons), yellow ~5%
  // (sparing badges & active-state accents only).
  // ===========================================================
  colors: {
    primary:   "#FF585C", // vibrant coral — primary CTAs, buttons, cursor
    secondary: "#7392B7", // dusty denim — secondary accent: links, icons, muted highlights
    accent:    "#F0F600", // yellow — sparing use: badges, pulse/active-state accents
    background:"#FFFFFF", // white — main page background (light mode)
    backgroundAlt: "#F6F6F4", // soft off-white — alternating section background
    text:      "#0F0F0F", // onyx — headings & primary text
    textSoft:  "#5C5C5C", // body copy / secondary text
    dark:      "#0F0F0F"  // onyx — dark sections (marquee, footer-on-dark, etc.)
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
    photo: "assets/your-photo.jpg",
    name: "Khizar Hayat",
    firstName: "Khizar",
    title: "Brand Identity & Packaging Designer",
    location: "Gujranwala, Pakistan",
    workingWith: "US · UK · Middle East",
    focus: "Startups & product businesses",
    availabilityNote: "Freelance & select retainers",
    availabilityBadge: "Available for freelance & fulltime",
    shortBio: "<strong>Logo systems, identity and packaging</strong> for founders who want to be taken seriously.",
    // teaserBio: short version shown on the homepage About teaser
    teaserBio: "a brand identity and packaging designer helping founders build brands with clarity and confidence.",
    // longBioIntro is the sentence that follows "I'm <Name>, " on the About page — don't repeat the name here
    longBioIntro: "a brand identity and packaging designer based in Gujranwala, Pakistan, working with founders internationally.",
    longBioExtra: "I help startups and product businesses build memorable brands — from first sketch to final files.",
    closingLine: "If your brand still feels undecided, that's usually where we start.",
    email: "madebykhizar@gmail.com",
    phone: "",
    whatsapp: "",
    website: "madebykhizar.com",
    // Path to a portrait photo for the homepage photo+about section.
    // Leave empty until you upload one — a placeholder will show instead.
    photo: "",
    photoSectionHeading: "The person behind the brand.",
    photoSectionBio: "I'm Khizar — a brand identity and packaging designer based in Gujranwala, Pakistan. I've spent the last 6+ years helping founders turn undecided brands into confident ones.",
  },

  // ===========================================================
  // SOCIAL LINKS — leave any field empty ("") to hide that icon/link
  // ===========================================================
  social: {
    behance: "https://www.behance.net/gdkhizarhayat",
    linkedin: "https://linkedin.com/in/gdkhizarhayat",
    instagram: "https://instagram.com/madebykhizar",
    twitter: "https://twitter.com/madebykhizar",
    whatsapp: "https://wa.link/kg29k3",
    dribbble: "",
    threads: "",
    facebook: ""
  },

  // ===========================================================
  // RESUME
  // ===========================================================
  resume: {
    url: "" // e.g. "assets/khizar-hayat-resume.pdf" — leave empty to hide the button
  },

  // ===========================================================
  // PRIMARY CTA (used in the hero button)
  // ===========================================================
  cta: {
    text: "Book Now",
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
    headline: "Brand identity for businesses<br><em>that need to be taken seriously.</em>"
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
  // ===========================================================
  clientBrands: [
    "JoJo", "BIOXY", "Hyundai", "Suzuki", "Burger Station",
    "Move Energy", "Wheels & Zameen", "Go Petroleum", "Wirsa Restaurant"
  ],

  // ===========================================================
  // SERVICES — shown as a short list on the homepage and in full
  // detail on services.html. Add/remove/edit freely.
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

  // ===========================================================
  // PROJECTS — every project card on the homepage & work page
  // is generated from this list. Add a new object to add a
  // project; delete one to remove it; set featured:true for the
  // large highlighted card.
  //
  // thumbnail / cover can point to a local file (e.g.
  // "projects/bioxy/thumbnail.jpg") once you add one to the
  // /projects folder, or stay pointed at an external URL.
  //
  // homepageOrder (optional, 1/2/3): controls which 3 projects
  // show in the homepage preview grid, and in what order. Leave
  // it off a project to keep it off the homepage (it still shows
  // on the full Work page).
  // ===========================================================
  projects: [
    {
      title: "Synvora®",
      category: "Tech / AI",
      tag: "Brand Guidelines",
      year: "2026",
      client: "Synvora",
      description: "Full brand guideline system for an AI company.",
      services: ["Brand Guidelines", "Logo Design"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/6aeedb252601027.Y3JvcCwyODY5LDIyNDQsMCww.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/6aeedb252601027.Y3JvcCwyODY5LDIyNDQsMCww.jpg",
      behanceLink: "https://www.behance.net/gallery/252601027/Synvora-AI-Brand-Guidelines",
      websiteLink: "",
      featured: true,
      cardLabel: "Featured",
      homepageOrder: 1
    },
    {
      title: "Bioxy S.L.",
      category: "Health & Wellness",
      tag: "Brand Identity",
      year: "2026",
      client: "Bioxy S.L.",
      description: "Global health & wellness brand identity.",
      services: ["Brand Identity", "Logo Design"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/83fbbe247246109.Y3JvcCwyODcwLDIyNDQsMCww.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/83fbbe247246109.Y3JvcCwyODcwLDIyNDQsMCww.jpg",
      behanceLink: "https://www.behance.net/gallery/247246109/Bioxy-SL-Global-Health-Wellness-Brand-Identity",
      websiteLink: "",
      featured: false,
      cardLabel: "Identity",
      homepageOrder: 2
    },
    {
      title: "Logofolio Vol. 1",
      category: "Logofolio",
      tag: "Marks & Logotypes",
      year: "2025",
      client: "Selected Clients",
      description: "A collection of selected logo marks and logotypes.",
      services: ["Logo Design"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/370f5a247244301.Y3JvcCwxMzk5LDEwOTUsMCww.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/370f5a247244301.Y3JvcCwxMzk5LDEwOTUsMCww.jpg",
      behanceLink: "https://www.behance.net/gallery/247244301/Logofolio-Vol1-Selected-Logo-Marks-Logotypes",
      websiteLink: "",
      featured: false,
      cardLabel: "Logofolio"
    },
    {
      title: "Minimal Mark",
      category: "Leather Goods",
      tag: "Logo Design",
      year: "2025",
      client: "Leather Goods Co.",
      description: "Minimal logo design for a leather goods brand.",
      services: ["Logo Design"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/7bcf93163338087.Y3JvcCwxMDQ5LDgyMSwwLDA.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/7bcf93163338087.Y3JvcCwxMDQ5LDgyMSwwLDA.jpg",
      behanceLink: "https://www.behance.net/gallery/163338087/Leather-Goods-Minimal-Logo-Design",
      websiteLink: "",
      featured: false,
      cardLabel: "Logo",
      homepageOrder: 3
    },
    {
      title: "40+ Social Media Posts",
      category: "Social Design",
      tag: "Brand Collateral",
      year: "2025",
      client: "Various",
      description: "A set of 40+ social media post designs.",
      services: ["Brand Collateral"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/4d950e247307077.Y3JvcCwzMTk2LDI0OTksMjc2LDA.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/4d950e247307077.Y3JvcCwzMTk2LDI0OTksMjc2LDA.jpg",
      behanceLink: "https://www.behance.net/gallery/247307077/40-Social-Media-Posts",
      websiteLink: "",
      featured: false,
      cardLabel: "Collateral"
    },
    {
      title: "Hyundai Gujranwala",
      category: "Automotive",
      tag: "Social Ad Design",
      year: "2024",
      client: "Hyundai Gujranwala",
      description: "Social media ad design campaign.",
      services: ["Brand Collateral"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/18adc2216177681.Y3JvcCwzMzAxLDI1ODIsMTE1Miww.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/18adc2216177681.Y3JvcCwzMzAxLDI1ODIsMTE1Miww.jpg",
      behanceLink: "https://www.behance.net/gallery/216177681/Hyundai-Gujranwala-Social-Media-Ad-Design",
      websiteLink: "",
      featured: false,
      cardLabel: "Campaign"
    },
    {
      title: "Personal Portfolio",
      category: "Self-Initiated",
      tag: "Portfolio System",
      year: "2024",
      client: "Self-Initiated",
      description: "A self-initiated personal portfolio project.",
      services: ["Brand Identity"],
      thumbnail: "https://mir-s3-cdn-cf.behance.net/projects/404/42b8f5247258565.Y3JvcCw2NDY1LDUwNTYsMCww.jpg",
      cover: "https://mir-s3-cdn-cf.behance.net/projects/404/42b8f5247258565.Y3JvcCw2NDY1LDUwNTYsMCww.jpg",
      behanceLink: "https://www.behance.net/gallery/247258565/Personal-Portfolio",
      websiteLink: "",
      featured: false,
      cardLabel: "Self-Initiated"
    }
  ],

  // ===========================================================
  // TESTIMONIALS — add objects here to show a testimonials
  // section. Leave the array empty ([]) to hide the section
  // entirely.
  // ===========================================================
  testimonials: [
    // Example — uncomment and edit to use:
    // {
    //   name: "Jordan Smith",
    //   company: "Acme Co.",
    //   role: "Founder",
    //   review: "Khizar completely nailed our brand identity.",
    //   photo: "assets/testimonials/jordan.jpg"
    // }
  ],

  // ===========================================================
  // PROCESS (How We'd Work — shown on homepage & services page)
  // ===========================================================
  process: [
    { title: "Discovery", description: "Understanding your business and where the brand falls short." },
    { title: "Strategy",  description: "Direction agreed before a single pixel is designed." },
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
    { question: "What's included in a brand identity package?", answer: "A primary logo with secondary marks, a colour and typography system, supporting iconography, and source files in AI, EPS, SVG and PNG — plus guidelines on how to use it all." },
    { question: "How many revisions do I get?", answer: "Every package includes a set number of focused revision rounds, agreed before we start. Strategy gets locked in early so revisions stay small and fast, not a redesign from scratch." },
    { question: "Do you work with clients outside Pakistan?", answer: "Yes — most of my clients are based in the US, UK and Middle East. All communication, files and calls are handled remotely." },
    { question: "How do we get started?", answer: "Book a discovery call or send a message through the contact form. We'll talk through your brand, timeline and budget, and I'll follow up with a proposal." }
  ],

  // ===========================================================
  // NAVIGATION
  // ===========================================================
  nav: [
    { label: "Work", href: "work.html", key: "work" },
    { label: "Services", href: "services.html", key: "services" },
    { label: "About", href: "about.html", key: "about" }
  ],

  // ===========================================================
  // SEO — per-page title & description. "home" / "about" /
  // "services" / "work" match each page's data-page attribute.
  // ===========================================================
  seo: {
    ogImage: "",
    pages: {
      home: {
        title: "Khizar Hayat — Brand Identity & Packaging Designer",
        description: "Khizar Hayat designs brand identity and packaging systems for startups and product businesses. Working with founders and teams internationally."
      },
      about: {
        title: "About — Khizar Hayat",
        description: "Khizar Hayat is a brand identity and packaging designer based in Gujranwala, Pakistan, working with founders and product teams internationally."
      },
      services: {
        title: "Services — Khizar Hayat",
        description: "Brand identity, brand guidelines, packaging design and brand collateral services by Khizar Hayat."
      },
      work: {
        title: "Work — Khizar Hayat",
        description: "Selected brand identity, packaging and logo design work by Khizar Hayat."
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
