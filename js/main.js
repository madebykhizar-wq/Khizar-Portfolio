// Shared interactive behaviors — runs after render.js has built the DOM.
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- page fade-in (avoids a flash of unstyled/empty content) ---------- */
  requestAnimationFrame(() => document.body.classList.add('page-ready'));

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.textContent = open ? 'Close' : 'Menu';
      navToggle.setAttribute('aria-expanded', String(open));
      applySiteLanguage(activeLanguage);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.textContent = 'Menu';
      navToggle.setAttribute('aria-expanded', 'false');
    }));

    // Close mobile nav on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.textContent = 'Menu';
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ---------- scroll-reveal animations ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
  window.observeReveals = (elements) => {
    elements.forEach(el => io.observe(el));
  };
  document.addEventListener('site-content-updated', () => {
    window.observeReveals(document.querySelectorAll('.work-grid .reveal:not(.in)'));
    if (window.applySiteLanguage) window.applySiteLanguage();
  });

  const brandStrip = document.querySelector('.brand-strip');
  const servicesStrip = document.querySelector('.services-marquee-strip');
  const brandMarqueeToggle = document.getElementById('brand-marquee-toggle');
  if (brandStrip && brandMarqueeToggle) {
    brandMarqueeToggle.addEventListener('click', () => {
      const paused = brandStrip.classList.toggle('is-paused');
      if (servicesStrip) servicesStrip.classList.toggle('is-paused', paused);
      brandMarqueeToggle.setAttribute('aria-pressed', String(paused));
      if (window.applySiteLanguage) window.applySiteLanguage();
    });
  }

  /* ---------- dark / light mode toggle ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'khizar-theme';
  function setTheme(mode) {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', mode);
    if (themeToggle) themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* storage unavailable, ignore */ }
  }
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { /* ignore */ }
  setTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- local interface translations ---------- */
  const translations = {
    es: {
      'Work': 'Proyectos', 'Services': 'Servicios', 'About me': 'Sobre mí',
      'Start a Project': 'Iniciar un proyecto', 'Selected Work': 'Proyectos destacados',
      'BRAND IDENTITY + PACKAGING': 'IDENTIDAD DE MARCA + PACKAGING',
      'Brand Identity &': 'Identidad de marca y',
      'Packaging for': 'packaging para',
      'Consumer Brands.': 'marcas de consumo.',
      'I build brands that stand out on the shelf.': 'Creo marcas que destacan en el estante.',
      'Strategy, identity, packaging — all working together.': 'Estrategia, identidad y packaging: todo en armonía.',
      'View Selected Work': 'Ver proyectos seleccionados',
      '6+ years in brand, FMCG & packaging design': 'Más de 6 años diseñando marcas, productos FMCG y packaging',
      'Trusted by 25+ brands worldwide': 'Más de 25 marcas confían en mi trabajo',
      'Packaging Design': 'Diseño de packaging',
      'Visual Systems': 'Sistemas visuales',
      'I design strategic logos, visual identities, and packaging that make your business look professional, memorable, and trusted.': 'Diseño logotipos, identidades visuales y packaging estratégicos para que tu negocio sea profesional, memorable y confiable.',
      'A few identities': 'Algunas identidades', 'worth a second look.': 'que merecen otra mirada.',
      'Logo systems, guidelines and packaging — built to last.': 'Sistemas de logotipos, guías y packaging diseñados para durar.',
      'Four ways to': 'Cuatro formas de', 'work together.': 'trabajar juntos.',
      'Clear direction, agreed before a single pixel is designed.': 'Una dirección clara, acordada antes de diseñar un solo píxel.',
      'Discuss a project': 'Hablemos de tu proyecto', 'Design that gives your brand permission to be confident.': 'Diseño para que tu marca transmita confianza.',
      'About Me': 'Sobre mí', 'How We\'d Work': 'Cómo trabajaremos',
      'A clear process,': 'Un proceso claro,', 'start to finish.': 'de principio a fin.',
      'What Clients Say': 'Lo que dicen los clientes', 'Kind words from': 'Buenas palabras de',
      'past collaborators.': 'quienes ya colaboraron.',
      'Questions I get a lot': 'Preguntas frecuentes',
      'Start a Project': 'Iniciar un proyecto', 'Your name': 'Tu nombre', 'Email': 'Correo electrónico',
      'What are you looking for?': '¿Qué necesitas?', 'Project details': 'Detalles del proyecto',
      'Send message': 'Enviar mensaje', 'Message received →': 'Mensaje recibido →',
      'Message on WhatsApp': 'Escríbeme por WhatsApp', 'All': 'Todos',
      'Brand Identity': 'Identidad de marca', 'Brand Guidelines': 'Guía de marca',
      'Packaging Design': 'Diseño de packaging', 'Brand Collateral': 'Materiales de marca',
      'Discovery': 'Descubrimiento', 'Planning': 'Planificación', 'Planing': 'Planificación',
      'Design': 'Diseño', 'Handoff': 'Entrega', 'Tech / AI': 'Tecnología / IA',
      'Health & Wellness': 'Salud y bienestar', 'Logofolio': 'Logofolio',
      'Social Design': 'Diseño para redes', 'Automotive': 'Automoción',
      'Self-Initiated': 'Proyecto personal', 'Featured': 'Destacado', 'Identity': 'Identidad',
      'Logo': 'Logotipo', 'Campaign': 'Campaña', 'Collateral': 'Materiales de marca',
      'Discover your business and where the brand falls short.': 'Entender tu negocio y las oportunidades de tu marca.',
      'Understanding your business and where the brand falls short.': 'Entender tu negocio y las oportunidades de tu marca.',
      'Direction agreed before a single pixel is designed.': 'Definir la dirección antes de diseñar un solo píxel.',
      'Concepts and a focused round of refinement.': 'Conceptos y una ronda de refinamiento enfocada.',
      'Final files and guidelines, ready to use.': 'Archivos y guías finales, listos para usar.',
      'How long does a project take?': '¿Cuánto dura un proyecto?',
      'What\'s included in a brand identity package?': '¿Qué incluye un paquete de identidad de marca?',
      'How many revisions do I get?': '¿Cuántas revisiones incluye?',
      'Do you work with clients outside Pakistan?': '¿Trabajas con clientes fuera de Pakistán?',
      'How do we get started?': '¿Cómo empezamos?',
      'Selected clients': 'Clientes seleccionados',
      'Pause client names': 'Pausar nombres',
      'Play client names': 'Reproducir nombres',
      'Chat with Khizar on WhatsApp': 'Habla con Khizar por WhatsApp',
      'Can you build an identity around my existing logo?': '¿Puedes crear una identidad a partir de mi logotipo actual?',
      'Yes. We can keep a logo that still fits your business and develop the supporting colours, typography, graphic elements and usage guidelines around it.': 'Sí. Podemos conservar un logotipo que siga representando tu negocio y crear a su alrededor colores, tipografía, elementos gráficos y pautas de uso.',
      'What do you need from me before starting an identity project?': '¿Qué necesitas antes de empezar un proyecto de identidad?',
      'A short discussion about your business, audience, goals and preferences gives us a clear starting point. I will share a proposal with the agreed scope before design begins.': 'Una breve conversación sobre tu negocio, público, objetivos y preferencias nos dará un punto de partida. Antes de diseñar, compartiré una propuesta con el alcance acordado.',
      'Can you design packaging for a product range?': '¿Puedes diseñar envases para una gama de productos?',
      'Yes. Packaging projects can cover the visual direction and label or packaging layouts for the agreed products. The exact formats, deliverables and print requirements are confirmed in the proposal.': 'Sí. El proyecto puede incluir la dirección visual y los diseños de etiquetas o envases acordados. La propuesta confirmará los formatos, entregables y requisitos de impresión.',
      'Will the packaging files be ready for my printer?': '¿Los archivos del envase estarán listos para imprenta?',
      "Print-ready artwork can be included when it is part of the agreed scope. Share your printer's dielines and production specifications so they can be accounted for before final files are prepared.": 'Se pueden incluir artes finales para imprenta si forman parte del alcance acordado. Comparte las plantillas y especificaciones de producción de tu imprenta antes de preparar los archivos finales.',
      'Copy': 'Copiar', 'Copied!': '¡Copiado!', 'Portfolio': 'Portafolio', 'Elsewhere': 'También en',
      'Filter projects': 'Filtrar proyectos', 'Go to contact form': 'Ir al formulario de contacto',
      'Choose language': 'Elegir idioma', 'Toggle dark mode': 'Cambiar modo oscuro', 'Toggle menu': 'Abrir menú',
      'Menu': 'Menú', 'Close': 'Cerrar',
      'Jordan Smith': 'Jordan Smith', 'jordan@company.com': 'jordan@company.com',
      'Brand identity, packaging, refresh...': 'Identidad de marca, packaging, renovación...',
      'A little about your business and timeline': 'Cuéntame sobre tu negocio y tus plazos'
    },
    fr: {
      'Work': 'Projets', 'Services': 'Services', 'About me': 'À propos',
      'Start a Project': 'Démarrer un projet', 'Selected Work': 'Projets choisis',
      'BRAND IDENTITY + PACKAGING': 'IDENTITÉ DE MARQUE + PACKAGING',
      'Brand Identity &': 'Identité de marque et',
      'Packaging for': 'packaging pour',
      'Consumer Brands.': 'les marques grand public.',
      'I build brands that stand out on the shelf.': 'Je crée des marques qui se démarquent en rayon.',
      'Strategy, identity, packaging — all working together.': 'Stratégie, identité et packaging — en parfaite harmonie.',
      'View Selected Work': 'Voir une sélection de projets',
      '6+ years in brand, FMCG & packaging design': 'Plus de 6 ans en identité de marque, produits de grande consommation et packaging',
      'Trusted by 25+ brands worldwide': 'Plus de 25 marques nous font confiance',
      'Packaging Design': 'Design d’emballage',
      'Visual Systems': 'Systèmes visuels',
      'I design strategic logos, visual identities, and packaging that make your business look professional, memorable, and trusted.': 'Je conçois des logos, identités visuelles et emballages stratégiques pour rendre votre entreprise professionnelle et mémorable.',
      'A few identities': 'Quelques identités', 'worth a second look.': 'qui méritent un second regard.',
      'Logo systems, guidelines and packaging — built to last.': 'Logos, chartes et emballages conçus pour durer.',
      'Four ways to': 'Quatre façons de', 'work together.': 'collaborer.',
      'Clear direction, agreed before a single pixel is designed.': 'Une direction claire, définie avant le premier pixel.',
      'Discuss a project': 'Parlons de votre projet', 'Design that gives your brand permission to be confident.': 'Un design qui donne confiance à votre marque.',
      'About Me': 'À propos de moi', 'How We\'d Work': 'Notre méthode',
      'A clear process,': 'Un processus clair,', 'start to finish.': 'du début à la fin.',
      'What Clients Say': 'Témoignages', 'Kind words from': 'Quelques mots de',
      'past collaborators.': 'mes anciens partenaires.',
      'Questions I get a lot': 'Les questions qu’on me pose souvent',
      'Your name': 'Votre nom', 'Email': 'E-mail', 'What are you looking for?': 'Quel est votre besoin ?',
      'Project details': 'Détails du projet', 'Send message': 'Envoyer le message',
      'Message received →': 'Message reçu →', 'Message on WhatsApp': 'Me contacter sur WhatsApp',
      'All': 'Tout', 'Brand Identity': 'Identité de marque', 'Brand Guidelines': 'Charte de marque',
      'Packaging Design': 'Design d’emballage', 'Brand Collateral': 'Supports de marque',
      'Discovery': 'Découverte', 'Planning': 'Planification', 'Planing': 'Planification',
      'Design': 'Design', 'Handoff': 'Livraison', 'Tech / AI': 'Tech / IA',
      'Health & Wellness': 'Santé et bien-être', 'Logofolio': 'Logofolio',
      'Social Design': 'Design social', 'Automotive': 'Automobile',
      'Self-Initiated': 'Projet personnel', 'Featured': 'À la une', 'Identity': 'Identité',
      'Logo': 'Logo', 'Campaign': 'Campagne', 'Collateral': 'Supports de marque',
      'Understanding your business and where the brand falls short.': 'Comprendre votre activité et les besoins de votre marque.',
      'Direction agreed before a single pixel is designed.': 'Une direction définie avant le premier pixel.',
      'Concepts and a focused round of refinement.': 'Des concepts et une phase de retouche ciblée.',
      'Final files and guidelines, ready to use.': 'Les fichiers finaux et leurs guides, prêts à l’emploi.',
      'How long does a project take?': 'Combien de temps dure un projet ?',
      'What\'s included in a brand identity package?': 'Que comprend une identité de marque ?',
      'How many revisions do I get?': 'Combien de révisions sont incluses ?',
      'Do you work with clients outside Pakistan?': 'Travaillez-vous avec des clients hors du Pakistan ?',
      'How do we get started?': 'Comment démarrer ?',
      'Selected clients': 'Quelques clients',
      'Pause client names': 'Mettre en pause',
      'Play client names': 'Reprendre',
      'Chat with Khizar on WhatsApp': 'Contacter Khizar sur WhatsApp',
      'Can you build an identity around my existing logo?': 'Pouvez-vous créer une identité autour de mon logo actuel ?',
      'Yes. We can keep a logo that still fits your business and develop the supporting colours, typography, graphic elements and usage guidelines around it.': 'Oui. Nous pouvons conserver un logo adapté à votre activité et créer les couleurs, la typographie, les éléments graphiques et les règles d’utilisation qui l’accompagnent.',
      'What do you need from me before starting an identity project?': 'De quoi avez-vous besoin avant de commencer une identité ?',
      'A short discussion about your business, audience, goals and preferences gives us a clear starting point. I will share a proposal with the agreed scope before design begins.': 'Un échange sur votre activité, votre public, vos objectifs et vos préférences nous donnera un point de départ clair. Je vous enverrai une proposition avec le périmètre convenu avant de commencer.',
      'Can you design packaging for a product range?': 'Pouvez-vous concevoir les emballages d’une gamme de produits ?',
      'Yes. Packaging projects can cover the visual direction and label or packaging layouts for the agreed products. The exact formats, deliverables and print requirements are confirmed in the proposal.': 'Oui. Le projet peut inclure la direction visuelle et les maquettes d’étiquettes ou d’emballages convenues. La proposition précisera les formats, les livrables et les exigences d’impression.',
      'Will the packaging files be ready for my printer?': 'Les fichiers d’emballage seront-ils prêts pour l’imprimeur ?',
      "Print-ready artwork can be included when it is part of the agreed scope. Share your printer's dielines and production specifications so they can be accounted for before final files are prepared.": 'Les fichiers prêts à imprimer peuvent être inclus dans le périmètre convenu. Transmettez les gabarits et les spécifications de votre imprimeur avant la préparation des fichiers finaux.',
      'Copy': 'Copier', 'Copied!': 'Copié !', 'Portfolio': 'Portfolio', 'Elsewhere': 'Ailleurs',
      'Filter projects': 'Filtrer les projets', 'Go to contact form': 'Accéder au formulaire',
      'Choose language': 'Choisir la langue', 'Toggle dark mode': 'Changer le mode sombre', 'Toggle menu': 'Ouvrir le menu',
      'Menu': 'Menu', 'Close': 'Fermer',
      'Jordan Smith': 'Jordan Smith', 'jordan@company.com': 'jordan@company.com',
      'Brand identity, packaging, refresh...': 'Identité, emballage, refonte...',
      'A little about your business and timeline': 'Quelques mots sur votre activité et vos délais'
    },
    de: {
      'Work': 'Arbeiten', 'Services': 'Leistungen', 'About me': 'Über mich',
      'Start a Project': 'Projekt starten', 'Selected Work': 'Ausgewählte Arbeiten',
      'BRAND IDENTITY + PACKAGING': 'MARKENIDENTITÄT + VERPACKUNG',
      'Brand Identity &': 'Markenidentität und',
      'Packaging for': 'Verpackung für',
      'Consumer Brands.': 'Konsumgütermarken.',
      'I build brands that stand out on the shelf.': 'Ich entwickle Marken, die im Regal auffallen.',
      'Strategy, identity, packaging — all working together.': 'Strategie, Identität und Verpackung — perfekt aufeinander abgestimmt.',
      'View Selected Work': 'Ausgewählte Arbeiten ansehen',
      '6+ years in brand, FMCG & packaging design': 'Über 6 Jahre Erfahrung mit Marken, FMCG und Verpackungsdesign',
      'Trusted by 25+ brands worldwide': 'Mehr als 25 Marken weltweit vertrauen mir',
      'Packaging Design': 'Verpackungsdesign',
      'Visual Systems': 'Visuelle Systeme',
      'I design strategic logos, visual identities, and packaging that make your business look professional, memorable, and trusted.': 'Ich gestalte strategische Logos, Markenauftritte und Verpackungen, die Unternehmen professionell und unverwechselbar machen.',
      'A few identities': 'Einige Markenauftritte', 'worth a second look.': 'die einen zweiten Blick verdienen.',
      'Logo systems, guidelines and packaging — built to last.': 'Logos, Richtlinien und Verpackungen – gemacht für die Zukunft.',
      'Four ways to': 'Vier Möglichkeiten,', 'work together.': 'zusammenzuarbeiten.',
      'Clear direction, agreed before a single pixel is designed.': 'Eine klare Richtung, bevor das erste Pixel gestaltet wird.',
      'Discuss a project': 'Projekt besprechen', 'Design that gives your brand permission to be confident.': 'Design, das deiner Marke Selbstvertrauen gibt.',
      'About Me': 'Über mich', 'How We\'d Work': 'So arbeiten wir',
      'A clear process,': 'Ein klarer Ablauf,', 'start to finish.': 'von Anfang bis Ende.',
      'What Clients Say': 'Kundenstimmen', 'Kind words from': 'Nette Worte von',
      'past collaborators.': 'früheren Partnern.',
      'Questions I get a lot': 'Fragen, die mir oft gestellt werden',
      'Your name': 'Dein Name', 'Email': 'E-Mail', 'What are you looking for?': 'Wobei kann ich helfen?',
      'Project details': 'Projektdetails', 'Send message': 'Nachricht senden',
      'Message received →': 'Nachricht erhalten →', 'Message on WhatsApp': 'Nachricht über WhatsApp',
      'All': 'Alle', 'Brand Identity': 'Markenidentität', 'Brand Guidelines': 'Markenrichtlinien',
      'Packaging Design': 'Verpackungsdesign', 'Brand Collateral': 'Markenmaterialien',
      'Discovery': 'Kennenlernen', 'Planning': 'Planung', 'Planing': 'Planung',
      'Design': 'Design', 'Handoff': 'Übergabe', 'Tech / AI': 'Tech / KI',
      'Health & Wellness': 'Gesundheit & Wellness', 'Logofolio': 'Logofolio',
      'Social Design': 'Social Media Design', 'Automotive': 'Automobil',
      'Self-Initiated': 'Eigenprojekt', 'Featured': 'Ausgewählt', 'Identity': 'Identität',
      'Logo': 'Logo', 'Campaign': 'Kampagne', 'Collateral': 'Markenmaterialien',
      'Understanding your business and where the brand falls short.': 'Das Unternehmen und die Potenziale der Marke verstehen.',
      'Direction agreed before a single pixel is designed.': 'Die Richtung steht fest, bevor das erste Pixel gestaltet wird.',
      'Concepts and a focused round of refinement.': 'Konzepte und eine gezielte Überarbeitungsrunde.',
      'Final files and guidelines, ready to use.': 'Finale Dateien und Richtlinien, sofort einsatzbereit.',
      'How long does a project take?': 'Wie lange dauert ein Projekt?',
      'What\'s included in a brand identity package?': 'Was gehört zu einem Markenauftritt?',
      'How many revisions do I get?': 'Wie viele Überarbeitungen sind enthalten?',
      'Do you work with clients outside Pakistan?': 'Arbeitest du mit Kunden außerhalb Pakistans?',
      'How do we get started?': 'Wie starten wir?',
      'Selected clients': 'Ausgewählte Kunden',
      'Pause client names': 'Namen anhalten',
      'Play client names': 'Namen abspielen',
      'Chat with Khizar on WhatsApp': 'Khizar auf WhatsApp schreiben',
      'Can you build an identity around my existing logo?': 'Kannst du eine Markenidentität rund um mein bestehendes Logo entwickeln?',
      'Yes. We can keep a logo that still fits your business and develop the supporting colours, typography, graphic elements and usage guidelines around it.': 'Ja. Ein Logo, das noch zu deinem Unternehmen passt, kann bleiben. Dazu entwickle ich passende Farben, Typografie, Grafikelemente und Anwendungsrichtlinien.',
      'What do you need from me before starting an identity project?': 'Was brauchst du vor dem Start eines Markenprojekts von mir?',
      'A short discussion about your business, audience, goals and preferences gives us a clear starting point. I will share a proposal with the agreed scope before design begins.': 'Ein kurzes Gespräch über dein Unternehmen, deine Zielgruppe, Ziele und Vorlieben schafft einen klaren Startpunkt. Vor dem Design erhältst du ein Angebot mit dem vereinbarten Umfang.',
      'Can you design packaging for a product range?': 'Kannst du Verpackungen für eine Produktreihe gestalten?',
      'Yes. Packaging projects can cover the visual direction and label or packaging layouts for the agreed products. The exact formats, deliverables and print requirements are confirmed in the proposal.': 'Ja. Das Projekt kann die visuelle Ausrichtung und vereinbarte Etiketten- oder Verpackungslayouts umfassen. Formate, Ergebnisse und Druckanforderungen werden im Angebot festgehalten.',
      'Will the packaging files be ready for my printer?': 'Sind die Verpackungsdateien für meine Druckerei vorbereitet?',
      "Print-ready artwork can be included when it is part of the agreed scope. Share your printer's dielines and production specifications so they can be accounted for before final files are prepared.": 'Druckfertige Daten können Teil des vereinbarten Umfangs sein. Sende vor der Fertigstellung die Stanzformen und Produktionsvorgaben deiner Druckerei.',
      'Copy': 'Kopieren', 'Copied!': 'Kopiert!', 'Portfolio': 'Portfolio', 'Elsewhere': 'Weitere Kanäle',
      'Filter projects': 'Projekte filtern', 'Go to contact form': 'Zum Kontaktformular',
      'Choose language': 'Sprache auswählen', 'Toggle dark mode': 'Dunkelmodus wechseln', 'Toggle menu': 'Menü öffnen',
      'Menu': 'Menü', 'Close': 'Schließen',
      'Jordan Smith': 'Jordan Smith', 'jordan@company.com': 'jordan@company.com',
      'Brand identity, packaging, refresh...': 'Markenauftritt, Verpackung, Überarbeitung...',
      'A little about your business and timeline': 'Ein paar Worte zu deinem Unternehmen und Zeitplan'
    }
  };
  const languageSelect = document.getElementById('languageSelect');
  const LANGUAGE_KEY = 'khizar-language';
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let activeLanguage = 'en';

  function applySiteLanguage(language) {
    activeLanguage = translations[language] ? language : 'en';
    document.documentElement.lang = activeLanguage;
    const dictionary = translations[activeLanguage] || {};
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const source = originalText.get(node) || '';
      const phrase = source.trim();
      const translated = dictionary[phrase];
      node.nodeValue = translated === undefined ? source : source.replace(phrase, translated);
    }

    document.querySelectorAll('input[placeholder], textarea[placeholder], [aria-label]').forEach(element => {
      ['placeholder', 'aria-label'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        let values = originalAttributes.get(element);
        if (!values) {
          values = {};
          originalAttributes.set(element, values);
        }
        if (!(attribute in values)) values[attribute] = element.getAttribute(attribute);
        const source = values[attribute];
        element.setAttribute(attribute, dictionary[source] || source);
      });
    });
    if (languageSelect) languageSelect.value = activeLanguage;
    if (brandMarqueeToggle) {
      const label = brandStrip && brandStrip.classList.contains('is-paused')
        ? 'Play client names'
        : 'Pause client names';
      brandMarqueeToggle.textContent = dictionary[label] || label;
    }
  }

  let savedLanguage = 'en';
  try { savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'en'; } catch (e) { /* storage unavailable */ }
  applySiteLanguage(savedLanguage);
  window.applySiteLanguage = () => applySiteLanguage(activeLanguage);
  if (languageSelect) {
    languageSelect.addEventListener('change', () => {
      applySiteLanguage(languageSelect.value);
      try { localStorage.setItem(LANGUAGE_KEY, activeLanguage); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------- active section navigation ---------- */
  const sectionLinks = document.querySelectorAll('.navlinks a[href^="#"]');
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
        });
      });
    }, { rootMargin: '-28% 0px -62% 0px' });
    sectionLinks.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- back to top floating button ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const topSentinel = document.createElement('span');
    topSentinel.setAttribute('aria-hidden', 'true');
    topSentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.insertBefore(topSentinel, document.body.firstChild);
    const topObserver = new IntersectionObserver(([entry]) => {
      backToTop.classList.toggle('visible', !entry.isIntersecting);
    }, { rootMargin: '480px 0px 0px 0px' });
    topObserver.observe(topSentinel);
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- copy email button ---------- */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = document.getElementById('contactEmailLink')?.textContent?.trim();
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        const original = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied!';
        setTimeout(() => { copyEmailBtn.textContent = original; }, 1800);
      } catch (e) {
        // Clipboard API unavailable — fail silently, the email is still a visible mailto link
      }
    });
  }

  /* ---------- animated counters (stats) ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animate = (el) => {
      const target = el.getAttribute('data-counter');
      const numMatch = target.match(/[\d.]+/);
      if (!numMatch) { el.textContent = target; return; }
      const num = parseFloat(numMatch[0]);
      const suffix = target.replace(numMatch[0], '');
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(num * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target);
          counterIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterIo.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  const faqList = document.getElementById('faq-list');
  if (faqList) {
    faqList.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close any other open item (accordion behavior)
      faqList.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.closest('.faq-item').querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  }

  /* ---------- contact form — sends via FormSubmit.co (no backend needed) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const cfg = window.SITE_CONFIG;
    const submitBtn = contactForm.querySelector('.btn');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    const destinationEmail = cfg && cfg.personal && cfg.personal.email;
    const statusBox = document.getElementById('contactFormStatus');
    const projectInput = document.getElementById('project');

    // Quick service fill chips
    contactForm.querySelectorAll('.form-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const fillText = chip.getAttribute('data-fill');
        if (projectInput) {
          projectInput.value = fillText;
          projectInput.focus();
        }
        contactForm.querySelectorAll('.form-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!destinationEmail) return;

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      if (!name || !email) {
        if (statusBox) {
          statusBox.innerHTML = '<div class="form-feedback error">Please provide both your name and a valid email address so I can get back to you.</div>';
        }
        if (!name && nameInput) nameInput.focus();
        else if (!email && emailInput) emailInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      if (statusBox) statusBox.innerHTML = '';

      try {
        const formData = new FormData(contactForm);
        formData.append('_subject', `New project inquiry from ${name || 'website visitor'}`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destinationEmail)}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if (!res.ok) throw new Error('Request failed');

        submitBtn.textContent = 'Message received →';
        submitBtn.style.opacity = '0.7';
        if (statusBox) {
          statusBox.innerHTML = `<div class="form-feedback success"><strong>Message received!</strong> Thank you${name ? ', ' + name : ''}. I've received your project details and will reply to <strong>${email}</strong> within 24 hours.</div>`;
        }
        contactForm.reset();
        contactForm.querySelectorAll('.form-chip').forEach(c => c.classList.remove('active'));
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        if (statusBox) {
          statusBox.innerHTML = `<div class="form-feedback error">Could not send automatically. Please email me directly at <a href="mailto:${destinationEmail}">${destinationEmail}</a> or message me on <a href="${cfg.social?.whatsapp || 'https://wa.link/kg29k3'}" target="_blank" rel="noopener">WhatsApp</a>.</div>`;
        }
      }
    });
  }

  /* ---------- GSAP hero and section text motion (smooth 60-120fps GPU accelerated) ---------- */
  const gsap = window.gsap;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (gsap && !reducedMotion) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
      // Optimize ScrollTrigger refresh & tick performance
      window.ScrollTrigger.config({ limitCallbacks: true, syncInterval: 120 });
    }

    const heading = document.querySelector('.hero h1');
    if (heading) {
      gsap.timeline({
        defaults: { ease: 'power3.out', force3D: true },
        onComplete: () => {
          document.querySelectorAll('.hero-cta').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.visibility = 'visible';
          });
        }
      })
        .from('.hero-trust', { y: 12, opacity: 0, duration: 0.35, clearProps: 'all' })
        .from('.hero-chip', { y: 12, opacity: 0, duration: 0.3, stagger: 0.05, clearProps: 'all' }, '-=0.15')
        .from(heading, { y: 32, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.15')
        .from('.hero h1 em', { y: 14, opacity: 0, duration: 0.5, clearProps: 'all' }, '-=0.35')
        .from('.hero-side p', { y: 14, opacity: 0, duration: 0.45, clearProps: 'all' }, '-=0.2')
        .from('.hero-cta', { y: 10, duration: 0.35, stagger: 0.06, clearProps: 'all' }, '-=0.15')
        .from('.hero-credibility', { y: 10, opacity: 0, duration: 0.35, clearProps: 'all' }, '-=0.15');
    }

    if (window.ScrollTrigger) {
      gsap.utils.toArray('.section-head:not(.faq-heading)').forEach(sectionHeading => {
        gsap.from(sectionHeading, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform',
          scrollTrigger: { trigger: sectionHeading, start: 'top 88%', once: true }
        });
      });
    }
  }
});
