// Get the current path from URL
function getCurrentPath() {
  // Get the full URL
  const fullUrl = window.location.href;
  const baseUrl = window.location.origin;

  // Extract the path after the base URL
  let path = fullUrl.replace(baseUrl, "");

  // Remove query parameters
  path = path.split("?")[0];

  // Remove leading slash
  path = path.replace(/^\/+/, "");

  // Remove the repository name if hosted in subdirectory
  const pathParts = path.split("/");
  if (
    pathParts.length > 1 &&
    pathParts[0] !== "404.html" &&
    !pathParts[0].includes(".")
  ) {
    // Check if first part is the repo name (common in GitHub Pages)
    const repoName = window.location.pathname.split("/")[1];
    if (pathParts[0] === repoName) {
      pathParts.shift();
      path = pathParts.join("/");
    }
  }

  // Remove '404.html' if present
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
function showErrorPage() {
  document.body.innerHTML = `
        <div class="container">
            <div class="error-icon">🔗❌</div>
            <h1>404 - Redirect Not Found</h1>
            <div class="url-display">📌 ${window.location.href}</div>
            <div class="message">Sorry, no redirect is configured for this URL path.</div>
            <div>
                <button onclick="window.history.back()">← Go Back</button>
                <button onclick="window.location.href='/'">🏠 Home</button>
            </div>
        </div>
    `;

  // Add styles for error page
  const style = document.createElement("style");
  style.textContent = `
        .error-icon { font-size: 5rem; margin-bottom: 1rem; animation: shake 0.5s ease-in-out; }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .url-display { background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 5px; font-family: monospace; margin: 1rem 0; word-break: break-all; }
        .message { margin: 1rem 0; line-height: 1.6; }
        button { background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 0.6rem 1.2rem; margin: 0.5rem; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: all 0.3s ease; }
        button:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
    `;
  document.head.appendChild(style);
}

// Main redirect logic
async function handleRedirect() {
  const currentPath = getCurrentPath();
  const statusElement = document.getElementById("status");

  // Skip if it's the home page or empty
  if (!currentPath || currentPath === "") {
    try {
      const config = await loadRedirects();
      if (config.default_redirect) {
        statusElement.textContent = `Redirecting to default: ${config.default_redirect}`;
        setTimeout(() => {
          window.location.href = config.default_redirect;
        }, config.redirect_delay || 1000);
      } else {
        showErrorPage();
      }
    } catch (error) {
      showErrorPage();
    }
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
      }, config.redirect_delay || 1000);
    } else {
      // No redirect found - show 404
      statusElement.textContent = `❌ No redirect found for "${currentPath}"`;
      setTimeout(() => {
        showErrorPage();
      }, 1500);
    }
  } catch (error) {
    console.error("Redirect error:", error);
    statusElement.textContent = "❌ Error loading configuration";
    setTimeout(() => {
      showErrorPage();
    }, 1500);
  }
}

// Start the redirect process
handleRedirect();
