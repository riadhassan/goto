// Get the current path from URL
function getCurrentPath() {
  const fullUrl = window.location.href;
  const baseUrl = window.location.origin;

  let path = fullUrl.replace(baseUrl, "");
  path = path.split("?")[0];
  path = path.replace(/^\/+/, "");

  const pathParts = path.split("/");
  if (
    pathParts.length > 1 &&
    pathParts[0] !== "404.html" &&
    !pathParts[0].includes(".")
  ) {
    const repoName = window.location.pathname.split("/")[1];
    if (pathParts[0] === repoName) {
      pathParts.shift();
      path = pathParts.join("/");
    }
  }

  if (path === "404.html" || path.startsWith("404.html")) {
    path = "";
  }

  return path;
}

// Load redirect configuration
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

// Show error 404 page
function showErrorPage(requestedPath) {
  // Clear existing content
  document.body.innerHTML = `
        <div class="error-container">
            <div class="error-icon">🔗❌</div>
            <h1>404 - Redirect Not Found</h1>
            <div class="url-display">
                📌 ${window.location.href}
            </div>
            <div class="message">
                No redirect configured for "<strong>${requestedPath}</strong>"
            </div>
            <div>
                <button onclick="window.location.href='/'">🏠 Personal Website</button>
            </div>
        </div>
    `;

  // Update body class for error page styling
  document.body.className = "error-body";
}

// Main redirect logic
async function handleRedirect() {
  const currentPath = getCurrentPath();
  const statusElement = document.getElementById("status");

  // If it's the base path (empty), show landing page
  if (!currentPath || currentPath === "") {
    window.location.href = "/goto";
    return;
  }

  try {
    const config = await loadRedirects();

    // Check for matching redirect
    if (config.redirects && config.redirects[currentPath]) {
      const redirectUrl = config.redirects[currentPath];
      statusElement.textContent = `✓ Redirect found! Going to: ${redirectUrl}`;

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, config.redirect_delay || 800);
    } else {
      // No redirect found - show 404
      statusElement.textContent = `❌ No redirect found for "${currentPath}"`;
      setTimeout(() => {
        showErrorPage(currentPath);
      }, 1200);
    }
  } catch (error) {
    console.error("Redirect error:", error);
    statusElement.textContent = "❌ Error loading configuration";
    setTimeout(() => {
      showErrorPage(currentPath);
    }, 1200);
  }
}

// Start the redirect process
handleRedirect();
