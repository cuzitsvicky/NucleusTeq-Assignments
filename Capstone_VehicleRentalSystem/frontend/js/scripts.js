const BASE_URL = "http://localhost:8080";

// Toggle mobile menu visibility
function toggleMenu() {
  const menu = document.querySelector(".navbar-menu");
  if (menu) menu.classList.toggle("open");
}

// Close mobile menu
function closeMenu() {
  const menu = document.querySelector(".navbar-menu");
  if (menu) menu.classList.remove("open");
}

// Set active admin navigation link
function setActiveAdminNav(key) {
  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.adminNav === key);
  });
}

let errorTimeout;

// Display error message in a container
function showError(message, elementId = "pageError") {
  const errorBox = document.getElementById(elementId);
  if (!errorBox) {
    alert(message);
    return;
  }

  // Clear previous timer
  if (errorTimeout) clearTimeout(errorTimeout);

  errorBox.textContent = message;
  errorBox.style.display = "block";
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });

  errorTimeout = setTimeout(() => {
    clearError(elementId);
  }, 3000);
}

// Clear error message display/
function clearError(elementId = "pageError") {
  const errorBox = document.getElementById(elementId);
  if (!errorBox) return;
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

// Show login overlay
function showLogin() {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.style.display = "flex";
  closeMenu();
}

//Hide login overlay
function hideLogin() {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.style.display = "none";
}

//Logout user and redirect to home
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// Get JWT token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Get current user data from localStorage
function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

// Save login data to localStorage
function saveLoginData(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("currentUser", JSON.stringify(data));
}

//Require user to be logged in (redirect to index.html if not)
function requireLogin() {
  if (!getToken()) window.location.href = "index.html";
}

//Require user to be admin (redirect if not admin)
function requireAdminPage() {
  const user = getCurrentUser();
  if (!user || user.role !== "ADMIN") window.location.href = "vehicles.html";
}

// Show admin navigation link if current user is admin
function showAdminNavIfNeeded() {
  const link = document.getElementById("adminNavLink");
  const user = getCurrentUser();
  if (link && user && user.role === "ADMIN")
    link.style.display = "inline-block";
}

async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  authRequired = false
) {
  const headers = {};
  
  if (body) headers["Content-Type"] = "application/json";
  
  if (authRequired) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    let data = null;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || null;
    }

    if (!response.ok) {
      throw new Error(data?.message || data || "Request failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Convert datetime-local format to backend format (adds :00 for seconds)
function formatDateTimeLocalToBackend(value) {
  return value ? `${value}:00` : "";
}

// Format ISO datetime string to readable locale string
function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

// Escape HTML special characters to prevent XSS
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Get vehicle image based on type
function getVehicleImage(type) {
  if (!type) return "img/car.png";

  const t = type.toLowerCase();

  if (t === "car") return "img/car3.png";
  if (t === "bike") return "img/bike.png";

  return "img/car.png";
}