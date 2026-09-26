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
    logoText: "MadebyKhizar",
    // Real logo mark — used in the nav and footer
    logoImage: "assets/logo.svg",
    // Shown on hover over the nav logo, and in the footer next to the logo.
    madeBy: "KHIZAR HAYAT",
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
  // ===========================================================
  clientBrands: [
    "GFI JOJO", "Bioxy SL", "Pakson Intenational", "Synora", "Hyundai", "Suzuki", "Burger Station",
    "Move Energy", "Wheels & Zameen", "Go Petroleum", "Wirsa Restaurant"
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

  // ===========================================================
  // PROJECTS — every project card in the homepage work showcase
  // is generated from this list. Add a new object to add a
  // project; delete one to remove it; set featured:true for the
  // large highlighted card.
  //
  // thumbnail / cover can point to a local file (e.g.
  // "projects/bioxy/thumbnail.jpg") once you add one to the
  // /projects folder, or stay pointed at an external URL.
  //
  // Projects appear in this order in the homepage showcase.
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
  //
  // The entries below are PLACEHOLDERS built from real client/
  // brand names already listed in clientBrands — the quote text
  // itself is not a real client quote yet. Replace each `review`
  // (and add a `photo` if you have one) with the client's actual
  // words before publishing. Six entries = two rows of three, so
  // the 4th card gets the inverted accent style.
  // ===========================================================
  testimonials: [
    {
      name: "Brand Team, JOJO",
      company: "JoJo",
      role: "Brand Team",
      review: "Khizar consistently delivered packaging designs that balanced creativity with commercial impact. His attention to detail, fast turnaround, and understanding of FMCG branding made him a valuable part of our product launches."
    },
    {
      name: "Founder, BIOXY",
      company: "BIOXY",
      role: "Founder",
      review: "Khizar transformed our vision into a professional brand identity that truly reflects our values. From the logo to the complete brand system, every detail was thoughtfully crafted and exceeded our expectations."
    },
    {
      name: "Marketing Team, Hyundai Gujranwala",
      company: "Hyundai Gujranwala",
      role: "Marketing Team",
      review: "Working with Khizar was smooth and efficient. His clean, modern design approach helped us create marketing visuals that strengthened our brand presence and connected well with our audience."
    },
    {
      name: "Marketing Team, Suzuki",
      company: "Suzuki",
      role: "Marketing Team",
      review: "Khizar delivered high-quality promotional designs with excellent attention to branding consistency. His creativity and professionalism made every project easy to manage."
    },
    {
      name: "Owner, Burger Station",
      company: "Burger Station",
      role: "Owner",
      review: "Khizar understood exactly what our brand needed. The visual identity and promotional materials he created gave our business a fresh, professional look that customers immediately noticed."
    },
    {
      name: "Founder, Move Energy",
      company: "Move Energy",
      role: "Founder",
      review: "Khizar brought clarity and consistency to our brand identity. His strategic thinking, combined with strong visual design skills, resulted in branding that we're proud to represent."
    }
  ],

  // ===========================================================
  // PROCESS (How We'd Work — shown on homepage & services page)
  // ===========================================================
  process: [
    { title: "Discovery", description: "Understanding your business and where the brand falls short." },
    { title: "Planing",  description: "Direction agreed before a single pixel is designed." },
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
