requireLogin();
showAdminNavIfNeeded();

const vehicleList       = document.getElementById("vehicleList");
const noVehiclesMessage = document.getElementById("noVehiclesMessage");
const bookingForm       = document.getElementById("bookingForm");

// State 
let allVehicles  = [];   
let activeType   = "all";
let activeStatus = "all";

// Load all vehicles from API once 
async function loadVehicles() {
    clearError();
    vehicleList.innerHTML = "";
    try {
        allVehicles = await apiRequest("/api/vehicles", "GET");
        applyFilters();
    } catch (error) {
        showError(error.message);
    }
}

// Chip selection
function setChip(el, group) {
    document.querySelectorAll(`.chip[data-filter="${group}"]`)
            .forEach(c => c.classList.remove("active"));
    el.classList.add("active");

    if (group === "type")   activeType   = el.dataset.value;
    if (group === "status") activeStatus = el.dataset.value;

    applyFilters();
}

// Reset all filters 
function resetFilters() {
    document.getElementById("searchInput").value = "";
    activeType   = "all";
    activeStatus = "all";

    document.querySelectorAll(".chip[data-filter]").forEach(c => {
        c.classList.toggle("active", c.dataset.value === "all");
    });

    applyFilters();
}

//  Core filter + render
function applyFilters() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();

    const filtered = allVehicles.filter(v => {
        const matchType = activeType === "all" || v.type === activeType;

        const matchStatus =
            activeStatus === "all"         ? true :
            activeStatus === "available"   ? v.availabilityStatus === true :
                                             v.availabilityStatus === false;

        const matchName = !query || v.name.toLowerCase().includes(query);

        return matchType && matchStatus && matchName;
    });

    renderVehicles(filtered);

    // Show result count when any filter is active
    const countEl = document.getElementById("filterCount");
    const isFiltering = activeType !== "all" || activeStatus !== "all" || query;
    if (isFiltering) {
        countEl.textContent = `Showing ${filtered.length} of ${allVehicles.length} vehicle${allVehicles.length !== 1 ? "s" : ""}`;
        countEl.style.display = "block";
    } else {
        countEl.style.display = "none";
    }
}

// Render a list of vehicle objects
function renderVehicles(vehicles) {
    vehicleList.innerHTML = "";

    if (!vehicles.length) {
        noVehiclesMessage.style.display = "block";
        return;
    }
    noVehiclesMessage.style.display = "none";

    vehicles.forEach(vehicle => {
        const card = document.createElement("div");
        card.className = "vehicle-card";

        const statusClass = vehicle.availabilityStatus ? "available" : "unavailable";
        const statusText  = vehicle.availabilityStatus ? "Available"  : "Unavailable";

        card.innerHTML = `
            <img src="${getVehicleImage(vehicle.type)}"
                 alt="${escapeHtml(vehicle.name)}"
                 class="vehicle-image">
            <div class="vehicle-content">
                <h3>${escapeHtml(vehicle.name)}</h3>
                <p><strong>Type:</strong> ${escapeHtml(vehicle.type)}</p>
                <p><strong>Description:</strong> ${escapeHtml(vehicle.description || "No description")}</p>
                <span class="status-pill ${statusClass}">${statusText}</span>
                <div class="card-actions">
                    ${vehicle.availabilityStatus
                        ? `<button class="btn" onclick="showBookingForm(${vehicle.vehicleId})">Book Now</button>`
                        : `<button class="btn" disabled>Currently Unavailable</button>`}
                </div>
            </div>`;

        vehicleList.appendChild(card);
    });
}

// Initial load
loadVehicles();