// Load and process redirects
async function loadRedirects() {
  try {
    const response = await fetch("config.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}

function getCurrentPath() {
  const path = window.location.pathname;
  // Remove leading slash and any trailing slashes
  let cleanPath = path.replace(/^\/+|\/+$/g, "");

  // Remove the base path if hosted in a subdirectory (for GitHub Pages)
  const basePath = window.location.pathname.split("/")[1];
  if (cleanPath === basePath) {
    cleanPath = "";
  } else if (cleanPath.startsWith(basePath + "/")) {
    cleanPath = cleanPath.substring(basePath.length + 1);
  }

  return cleanPath;
}

function show404Page() {
  const baseUrl =
    window.location.origin +
    window.location.pathname.split("/").slice(0, -1).join("/");
  window.location.href = baseUrl + "/404.html";
}

function handleRedirect() {
  const currentPath = getCurrentPath();
  const statusElement = document.getElementById("status");

  loadRedirects()
    .then((config) => {
      // Check for exact match
      if (config.redirects && config.redirects[currentPath]) {
        const redirectUrl = config.redirects[currentPath];
        statusElement.textContent = `✓ Redirect found! Going to: ${redirectUrl}`;

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, config.redirect_delay || 1000);
      }
      // Check for default redirect when no path specified
      else if (config.default_redirect && currentPath === "") {
        statusElement.textContent = `Redirecting to default: ${config.default_redirect}`;
        setTimeout(() => {
          window.location.href = config.default_redirect;
        }, config.redirect_delay || 1000);
      } else {
        // Show 404 page for unmapped paths
        statusElement.textContent = `❌ No redirect found for "/${currentPath}"`;
        setTimeout(() => {
          show404Page();
        }, 1500);
      }
    })
    .catch((error) => {
      statusElement.textContent = "❌ Error loading redirect configuration.";
      statusElement.classList.add("error");
      console.error("Redirect error:", error);
      setTimeout(() => {
        show404Page();
      }, 1500);
    });
}

// Start the redirect process
handleRedirect();
