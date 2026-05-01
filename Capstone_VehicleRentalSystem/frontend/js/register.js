
/* Handle registration form submission */
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const errorDiv = document.getElementById("error");
  
  /* Clear previous errors */
  errorDiv.style.display = "none";

  /* Validate inputs */
  if (!username || !email || !password) {
    errorDiv.textContent = "Please fill in all fields";
    errorDiv.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = "Password must be at least 6 characters";
    errorDiv.style.display = "block";
    return;
  }

  if (username.length < 3) {
    errorDiv.textContent = "Username must be at least 3 characters";
    errorDiv.style.display = "block";
    return;
  }

  /* Basic email validation */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorDiv.textContent = "Please enter a valid email address";
    errorDiv.style.display = "block";
    return;
  }

  try {
    /* Call signup API */
    await apiRequest("/api/auth/signup", "POST", { 
      username, 
      email, 
      password, 
      role 
    });
    
    /* Show success message */
    alert("Registration successful! Please login with your new account.");
    window.location.href = "index.html";
  } catch (error) {
    errorDiv.textContent = error.message || "Registration failed";
    errorDiv.style.display = "block";
  }
});