// Check if user is already logged in and redirect accordingly
const existingUser = getCurrentUser();
if (existingUser && getToken()) {
  window.location.href = existingUser.role === "ADMIN" ? "admin.html" : "vehicles.html";
}

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");
  
  // Clear previous errors
  errorDiv.style.display = "none";

  // Validate inputs
  if (!username || !password) {
    errorDiv.textContent = "Please enter both username and password";
    errorDiv.style.display = "block";
    return;
  }

  try {
    // Call login API
    const data = await apiRequest("/api/auth/login", "POST", { username, password });
    
    // Save login data
    saveLoginData(data);
    
    // Redirect based on role
    window.location.href = data.role === "ADMIN" ? "admin.html" : "vehicles.html";
  } catch (error) {
    errorDiv.textContent = error.message || "Invalid username or password";
    errorDiv.style.display = "block";
  }
});