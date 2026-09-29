(function () {
  const config = window.SITE_CONFIG;
  if (!config) {
    console.error("Project content was not loaded because SITE_CONFIG is missing.");
    return;
  }

  window.SITE_PROJECTS_LOADING = true;
  const isHttpUrl = value => {
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };
  fetch("content/projects.json")
    .then(response => {
      if (!response.ok) throw new Error(`Project content request failed (${response.status}).`);
      return response.json();
    })
    .then(content => {
      if (!content || !Array.isArray(content.projects)) {
        throw new TypeError("Project content must include a projects array.");
      }
      const requiredText = ["title", "category", "tag", "year", "client", "description", "thumbnail", "cover", "cardLabel"];
      content.projects.forEach((project, index) => {
        if (!project || typeof project !== "object" ||
            requiredText.some(field => typeof project[field] !== "string" || !project[field].trim()) ||
            !Array.isArray(project.services) ||
            project.services.some(service => typeof service !== "string") ||
            typeof project.featured !== "boolean" ||
            ["behanceLink", "websiteLink"].some(field =>
              project[field] !== undefined &&
              (typeof project[field] !== "string" ||
                (project[field] !== "" && !isHttpUrl(project[field])))) ||
            !isHttpUrl(project.thumbnail) || !isHttpUrl(project.cover)) {
          throw new TypeError(`Project entry ${index + 1} is incomplete or invalid.`);
        }
      });
      config.projects = content.projects;
      window.SITE_PROJECTS_LOADING = false;
      document.dispatchEvent(new CustomEvent("site-projects-ready"));
    })
    .catch(error => {
      console.error("Unable to load portfolio projects:", error);
      config.projects = [];
      window.SITE_PROJECTS_ERROR = error;
      window.SITE_PROJECTS_LOADING = false;
      document.dispatchEvent(new CustomEvent("site-projects-ready"));
    });
})();
