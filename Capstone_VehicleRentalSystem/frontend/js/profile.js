requireLogin();
showAdminNavIfNeeded();

/* Utility function to format a date string into a more readable format (e.g. "15 August 2023"). */
function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** Utility function to format a date string into a year-only format (e.g. "2023"). */
function formatYear(value) {
    if (!value) return "—";
    return new Date(value).getFullYear().toString();
}


/** Utility function to display the time elapsed since a given date (e.g. "2 days ago"). */
function timeAgo(value) {
    if (!value) return "—";
    const diff = Date.now() - new Date(value).getTime();
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) return years + (years === 1 ? " year ago" : " years ago");
    if (months > 0) return months + (months === 1 ? " month ago" : " months ago");
    if (days > 0) return days + (days === 1 ? " day ago" : " days ago");
    return "Today";
}

/* Loads the current user's profile information from the API and updates the UI elements accordingly. */
async function loadProfile() {
    clearError();
    try {
        const user = await apiRequest("/api/users/me", "GET", null, true);

        const initial = (user.username || "U").charAt(0).toUpperCase();
        document.getElementById("avatarCircle").textContent = initial;

        document.getElementById("displayName").textContent = user.username || "—";
        document.getElementById("displayEmail").textContent = user.email || "—";

        document.getElementById("statUserId").textContent = "#" + (user.userId || "—");
        document.getElementById("statRole").textContent = user.role || "—";
        document.getElementById("statMemberSince").textContent = formatYear(user.createdAt);

        document.getElementById("infoUsername").textContent = user.username || "—";
        document.getElementById("infoEmail").textContent = user.email || "—";
        document.getElementById("infoCreated").textContent = formatDate(user.createdAt);

        const badge = document.getElementById("roleBadge");
        const badgeText = document.getElementById("roleBadgeText");
        badgeText.textContent = user.role || "User";
        
        if (user.role === "ADMIN") {
            badge.className = "role-badge admin";
        }

        document.getElementById("tlJoinTime").textContent = timeAgo(user.createdAt);

    } catch (error) {
        showError(error.message);
    }
}

/* Initializes the profile page by loading the user's profile information. */
loadProfile();