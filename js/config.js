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
    // kept as an alias to bodyFont; Playfair Display is used for process-section accents.
    monoFont: "'Inter', sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap"
  },

  // ===========================================================
  // PERSONAL INFO
  // ===========================================================
  personal: {
    name: "Khizar Hayat",
    firstName: "Khizar",
    title: "Brand Identity & Packaging Designer",
    location: "Gujranwala, Pakistan",
    workingWith: "Pakistan & Worldwide · US · UK · Middle East",
    focus: "Consumer goods, FMCG & growing brands",
    availabilityNote: "Freelance & select studio retainers",
    availabilityBadge: "Available for Projects & Retainers",
    shortBio: "I design strategic brand identities, logo systems, and packaging that help consumer products look established and perform on the shelf.",
    teaserBio: "an independent brand identity and packaging designer helping product businesses and founders build coherent, shelf-ready visual systems.",
    longBioIntro: "a brand identity and packaging designer based in Gujranwala, Pakistan, collaborating with founders and consumer brands worldwide.",
    longBioExtra: "I help consumer brands, FMCG businesses, and startups build strategic visual systems — from positioning and typography to shelf-ready packaging dielines and production handoff.",
    closingLine: "If your brand or product packaging needs clarity and shelf standout, that's where we start.",
    email: "madebykhizar@gmail.com",
    phone: "+923420255825",
    whatsapp: "+923420255825",
    website: "madebykhizar.com",
    photo: "assets/my-photo.jpg",
    photoSectionHeading: "The designer behind the work.",
    photoSectionHighlight: "behind the work.",
    photoSectionBioHighlight: "6+ years",
    photoSectionBio: "I'm Khizar — an independent brand identity and packaging designer based in Gujranwala, Pakistan. Over the past 6+ years, I have worked with consumer brands, food & FMCG businesses, and startups to turn rough ideas into confident, market-ready brand systems.",
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
    url: "assets/khizar-hayat-resume.pdf"
  },

  // ===========================================================
  // PRIMARY CTA
  // ===========================================================
  cta: {
    text: "Start a Project",
    link: "#contact"
  },

  // Text shown on the small nav button (top right of every page)
  navCtaText: "Start a Project",

  // ===========================================================
  // HERO SECTION (homepage)
  // ===========================================================
  hero: {
    headline: "Brand Identity &amp; <span class=\"hero-packaging-for\">Packaging for</span><br><em>Consumer Brands.</em>",
    description: "<strong>Built for shelf impact, clarity, and real-world scale.</strong><br>Strategic identity systems, packaging, and brand guidelines for growing businesses.",
    credibility: "Brand Identity · FMCG & Product Packaging · Visual Systems",
    badge: "Available for new projects & retainers",
    chips: [
      { icon: "target", label: "Brand Identity" },
      { icon: "package", label: "Packaging Systems" },
      { icon: "star",    label: "Design Systems" }
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
    { name: "Hyundai Gujranwala", sub: "Dealership Campaign",       logo: "hyundai",  logoImage: "" },
    { name: "Pakson Boss",        sub: "Home Appliances Collateral", logo: "boss",     logoImage: "https://ahmmjhubfwhazewptrad.supabase.co/storage/v1/object/public/site-assets/uploads/1790761891734-n9wodf.webp" },
    { name: "Bioxy S.L.",         sub: "Health & Wellness Identity", logo: "bioxy",    logoImage: "" },
    { name: "Synvora®",           sub: "AI Brand Guidelines",       logo: "synvora",  logoImage: "" },
    { name: "Suzuki",             sub: "Promotional Collateral",    logo: "suzuki",   logoImage: "" },
    { name: "Go Petroleum",       sub: "Energy Retail Collateral",  logo: "go",       logoImage: "" },
    { name: "GFI JOJO",           sub: "Confectionery Collateral",  logo: "jojo",     logoImage: "" },
    { name: "Sonex Nonstick",     sub: "Cookware Collateral",       logo: "sonex",    logoImage: "" },
    { name: "Burger Station",     sub: "Food & Dining Branding",    logo: "burger",   logoImage: "" },
    { name: "Move Energy",        sub: "Beverage Branding",         logo: "move",     logoImage: "" },
    { name: "Wirsa Restaurant",   sub: "Authentic Dining Identity", logo: "wirsa",    logoImage: "" }
  ],

  // ===========================================================
  // SERVICES — shown on homepage and services page
  // ===========================================================
  services: [
    {
      title: "Brand Identity Systems",
      description: "Coherent logo suites, typography architecture, and color rules engineered to scale across digital and physical touchpoints.",
      tags: ["Logo Suites", "Typography", "Color System", "Brand Book"],
      deliverables: [
        "Primary logo suite + secondary lockups & marks",
        "Digital & print typography hierarchy specifications",
        "Color palette with CMYK, Pantone & RGB standards",
        "Vector master files (AI, EPS, SVG, PDF, PNG)"
      ]
    },
    {
      title: "Packaging & Label Design",
      description: "Shelf-ready packaging systems, dieline setups, and product range architecture built for high shelf standout.",
      tags: ["Dielines", "Shelf Impact", "SKU Architecture", "Print-Ready"],
      deliverables: [
        "Packaging structure & dieline layout setup",
        "SKU extension & product range architecture",
        "Label design with finishing specs (emboss, foil, spot UV)",
        "Production-ready artwork with printer proofing support"
      ]
    },
    {
      title: "Brand Guidelines & Systems",
      description: "Authoritative brand manuals that protect your visual equity and ensure your team never compromises design consistency.",
      tags: ["Brand Manual", "Clear Space", "Asset Library", "Rules"],
      deliverables: [
        "Logo construction, clear-space & scale rules",
        "Acceptable & prohibited brand usage examples",
        "Imagery, iconography & layout grid standards",
        "Packaged master asset library ready for team handoff"
      ]
    },
    {
      title: "Commercial Collateral & Motion",
      description: "Marketing campaign assets, promotional launch collateral, and animated logo stings that maintain strict visual consistency.",
      tags: ["Campaigns", "Motion Stings", "Social Kits", "Collateral"],
      deliverables: [
        "Product launch campaign collateral & promotional kits",
        "Animated brand motion stings & logo reveals",
        "Digital marketing & social media presentation templates",
        "Fully layered, editable source files for internal use"
      ]
    }
  ],

  // Project entries are loaded from content/projects.json
  projects: [],

  // ===========================================================
  // TESTIMONIALS — Real client-approved quotes only.
  // Left empty until authentic quotes are verified and approved.
  // ===========================================================
  testimonials: [],

  // ===========================================================
  // PROCESS (A Proven 5-Step Brand Framework)
  // ===========================================================
  process: [
    { title: "01 Discover", description: "Audit the product category, competitor landscape, and target audience expectations." },
    { title: "02 Define",   description: "Establish the creative direction, positioning strategy, and visual principles before designing." },
    { title: "03 Design",   description: "Craft the logo suite, typography hierarchy, and core visual identity system." },
    { title: "04 Apply",    description: "Translate the identity into shelf-ready packaging dielines, digital interfaces, and touchpoints." },
    { title: "05 Deliver",  description: "Provide organized production-ready print files, vector packages, and comprehensive guidelines." }
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
