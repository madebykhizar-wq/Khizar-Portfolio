(function () {
  const config = window.SITE_CONFIG;
  if (!config) {
    console.error("Project content was not loaded because SITE_CONFIG is missing.");
    return;
  }

  window.SITE_PROJECTS_LOADING = true;

  const isValidUrlOrPath = value => {
    if (typeof value !== "string" || !value.trim()) return false;
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") ||
        trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("assets/") ||
        trimmed.startsWith("projects/") || trimmed.startsWith("data:image/")) {
      return true;
    }
    try {
      new URL(trimmed, window.location.href);
      return true;
    } catch {
      return false;
    }
  };

  // 1. Try loading live projects from Supabase Database
  async function loadFromSupabase() {
    const sb = config.supabase;
    if (!sb || !sb.url || !sb.anonKey) throw new Error("Supabase is not configured.");

    const endpoint = `${sb.url.replace(/\/+$/, '')}/rest/v1/projects?select=*&order=sort_order.asc,created_at.desc`;
    const res = await fetch(endpoint, {
      headers: {
        'apikey': sb.anonKey,
        'Authorization': `Bearer ${sb.anonKey}`
      }
    });

    if (!res.ok) throw new Error(`Supabase request failed (${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error("No projects found in Supabase.");

    function parseImages(item) {
      let list = [];
      if (Array.isArray(item.images) && item.images.length) {
        list = item.images.filter(isValidUrlOrPath);
      } else if (typeof item.cover === "string" && item.cover.startsWith("[")) {
        try {
          const parsed = JSON.parse(item.cover);
          if (Array.isArray(parsed)) list = parsed.filter(isValidUrlOrPath);
        } catch(e) {}
      } else if (typeof item.cover === "string" && item.cover.includes("|||")) {
        list = item.cover.split("|||").map(s => s.trim()).filter(isValidUrlOrPath);
      }

      if (!list.length) {
        if (isValidUrlOrPath(item.cover)) list.push(item.cover.trim());
        if (isValidUrlOrPath(item.thumbnail) && !list.includes(item.thumbnail.trim())) {
          list.push(item.thumbnail.trim());
        }
      }
      return list;
    }

    const mapped = data.map(item => {
      const images = parseImages(item);
      const primaryThumb = item.thumbnail || (images[0] || "");
      const primaryCover = (images[0] || item.cover || primaryThumb);
      return {
        id: item.id,
        title: item.title || "",
        category: item.category || "Identity",
        tag: item.tag || "Brand Identity",
        year: String(item.year || ""),
        client: item.client || "",
        description: item.description || "",
        services: Array.isArray(item.services) ? item.services : (item.services ? [item.services] : [item.tag || "Design"]),
        thumbnail: primaryThumb,
        cover: primaryCover,
        images: images.length ? images : [primaryCover].filter(Boolean),
        behanceLink: item.behance_link || item.behanceLink || "",
        websiteLink: item.website_link || item.websiteLink || "",
        featured: Boolean(item.featured),
        cardLabel: item.card_label || item.cardLabel || (item.featured ? "Featured" : item.tag || "Project"),
        sortOrder: Number(item.sort_order) || 0
      };
    });

    // FEATURED ALWAYS AT TOP OF WEBSITE
    mapped.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    return mapped;
  }

  // 2. Fallback to local content/projects.json if offline or Supabase fails
  async function loadFromLocalFile() {
    const response = await fetch("content/projects.json");
    if (!response.ok) throw new Error(`Project content request failed (${response.status}).`);
    const content = await response.json();
    if (!content || !Array.isArray(content.projects)) {
      throw new TypeError("Project content must include a projects array.");
    }
    const mapped = content.projects.map(p => {
      let images = Array.isArray(p.images) ? p.images.filter(isValidUrlOrPath) : [];
      if (!images.length) {
        if (isValidUrlOrPath(p.cover)) images.push(p.cover);
        if (isValidUrlOrPath(p.thumbnail) && !images.includes(p.thumbnail)) images.push(p.thumbnail);
      }
      return {
        ...p,
        images: images.length ? images : [p.cover || p.thumbnail].filter(Boolean),
        featured: Boolean(p.featured),
        sortOrder: Number(p.sortOrder || p.sort_order) || 0
      };
    });

    // FEATURED ALWAYS AT TOP OF WEBSITE
    mapped.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    return mapped;
  }

  // 3. Load client brands from Supabase Cloud (dynamic logos)
  async function loadClientBrandsFromSupabase() {
    const sb = config.supabase;
    if (!sb || !sb.url || !sb.anonKey) return;
    try {
      const endpoint = `${sb.url.replace(/\/+$/, '')}/rest/v1/client_brands?select=*&order=sort_order.asc`;
      const res = await fetch(endpoint, {
        headers: { 'apikey': sb.anonKey, 'Authorization': `Bearer ${sb.anonKey}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        config.clientBrands = data.map(b => ({
          name: b.name,
          sub: b.sub || "",
          logoImage: b.logo_image_url || "",
          logo: (b.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        }));
        if (typeof window.renderClientBrands === "function") {
          window.renderClientBrands();
        } else {
          document.dispatchEvent(new CustomEvent("site-client-brands-ready"));
        }
      }
    } catch(err) {
      console.warn("Could not load client brands from Supabase:", err.message);
    }
  }

  loadClientBrandsFromSupabase();

  // Load handler
  loadFromSupabase()
    .then(projects => {
      config.projects = projects;
      window.SITE_PROJECTS_SOURCE = "supabase";
      window.SITE_PROJECTS_LOADING = false;
      document.dispatchEvent(new CustomEvent("site-projects-ready"));
    })
    .catch(supabaseErr => {
      console.warn("Supabase fetch unavailable, falling back to local projects.json:", supabaseErr.message);
      loadFromLocalFile()
        .then(projects => {
          config.projects = projects;
          window.SITE_PROJECTS_SOURCE = "local";
          window.SITE_PROJECTS_LOADING = false;
          document.dispatchEvent(new CustomEvent("site-projects-ready"));
        })
        .catch(localErr => {
          console.error("Unable to load portfolio projects from both Supabase and local file:", localErr);
          config.projects = [];
          window.SITE_PROJECTS_ERROR = localErr;
          window.SITE_PROJECTS_LOADING = false;
          document.dispatchEvent(new CustomEvent("site-projects-ready"));
        });
    });
})();
