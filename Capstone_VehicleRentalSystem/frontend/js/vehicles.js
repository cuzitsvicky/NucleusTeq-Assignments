requireLogin();
showAdminNavIfNeeded();

const vehicleList       = document.getElementById("vehicleList");
const noVehiclesMessage = document.getElementById("noVehiclesMessage");
const bookingForm       = document.getElementById("bookingForm");

// State
let allVehicles      = [];   // full list from API (all vehicles)
let dateFilteredVehicles = null; // null = no date filter active
let activeType       = "all";
let activeStatus     = "all";
let dateFilterActive = false;

// ── Set min datetime on filter inputs to now ──
(function initDateFilterMinimums() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 16);
    document.getElementById("filterStart").min = local;
    document.getElementById("filterEnd").min   = local;
})();

document.getElementById("filterStart").addEventListener("change", function () {
    const endInput = document.getElementById("filterEnd");
    endInput.min = this.value;
    if (endInput.value && endInput.value <= this.value) {
        endInput.value = "";
    }
});

// ── Load all vehicles from API once ──
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

// ── Date range filter: call backend with start/end ──
async function applyDateFilter() {
    const startVal = document.getElementById("filterStart").value;
    const endVal   = document.getElementById("filterEnd").value;
    const errEl    = document.getElementById("dateFilterError");

    errEl.style.display = "none";

    if (!startVal || !endVal) {
        errEl.textContent = "Please select both a start and end date.";
        errEl.style.display = "block";
        return;
    }

    const start = new Date(startVal);
    const end   = new Date(endVal);
    const now   = new Date();

    if (start < now) {
        errEl.textContent = "Start date cannot be in the past.";
        errEl.style.display = "block";
        return;
    }

    if (end <= start) {
        errEl.textContent = "End date must be after start date.";
        errEl.style.display = "block";
        return;
    }

    // Format as ISO for backend query param
    const startIso = new Date(startVal).toISOString().slice(0, 19);
    const endIso   = new Date(endVal).toISOString().slice(0, 19);

    try {
        document.getElementById("checkAvailabilityBtn").disabled = true;
        document.getElementById("checkAvailabilityBtn").textContent = "Checking…";

        dateFilteredVehicles = await apiRequest(
            `/api/vehicles/available?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`,
            "GET"
        );

        dateFilterActive = true;
        document.getElementById("dateFilterBadge").style.display = "flex";
        document.getElementById("clearDateFilterBtn").style.display = "inline-flex";

        // Pre-fill booking form dates when user clicks Book Now
        sessionStorage.setItem("prefillStart", startVal);
        sessionStorage.setItem("prefillEnd", endVal);

        applyFilters();
    } catch (error) {
        errEl.textContent = error.message || "Failed to check availability.";
        errEl.style.display = "block";
    } finally {
        document.getElementById("checkAvailabilityBtn").disabled = false;
        document.getElementById("checkAvailabilityBtn").textContent = "Check";
    }
}

// ── Clear date filter ──
function clearDateFilter() {
    dateFilteredVehicles = null;
    dateFilterActive     = false;
    document.getElementById("filterStart").value       = "";
    document.getElementById("filterEnd").value         = "";
    document.getElementById("dateFilterBadge").style.display = "none";
    document.getElementById("clearDateFilterBtn").style.display = "none";
    document.getElementById("dateFilterError").style.display   = "none";
    sessionStorage.removeItem("prefillStart");
    sessionStorage.removeItem("prefillEnd");
    applyFilters();
}

// ── Chip selection ──
function setChip(el, group) {
    document.querySelectorAll(`.chip[data-filter="${group}"]`)
            .forEach(c => c.classList.remove("active"));
    el.classList.add("active");
    if (group === "type")   activeType   = el.dataset.value;
    if (group === "status") activeStatus = el.dataset.value;
    applyFilters();
}

// ── Reset all filters ──
function resetFilters() {
    document.getElementById("searchInput").value = "";
    activeType   = "all";
    activeStatus = "all";
    document.querySelectorAll(".chip[data-filter]").forEach(c => {
        c.classList.toggle("active", c.dataset.value === "all");
    });
    clearDateFilter();
}

// ── Core filter + render ──
function applyFilters() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();

    // Use date-filtered list if active, otherwise full list
    const baseList = dateFilterActive ? dateFilteredVehicles : allVehicles;

    const filtered = baseList.filter(v => {
        const matchType   = activeType === "all" || v.type === activeType;

        // When date filter is active, all returned vehicles are already confirmed
        // available — so status filter only applies to the unavailable chip
        // (date-filtered results are always availabilityStatus=true from backend)
        const matchStatus =
            activeStatus === "all"         ? true :
            activeStatus === "available"   ? v.availabilityStatus === true :
                                             v.availabilityStatus === false;

        const matchName   = !query || v.name.toLowerCase().includes(query);
        return matchType && matchStatus && matchName;
    });

    renderVehicles(filtered);

    const countEl       = document.getElementById("filterCount");
    const totalBase     = dateFilterActive ? dateFilteredVehicles.length : allVehicles.length;
    const isFiltering   = activeType !== "all" || activeStatus !== "all" || query || dateFilterActive;

    if (isFiltering) {
        const label = dateFilterActive
            ? `${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""} available for your dates`
            : `Showing ${filtered.length} of ${totalBase} vehicle${totalBase !== 1 ? "s" : ""}`;
        countEl.textContent    = label;
        countEl.style.display  = "block";
    } else {
        countEl.style.display  = "none";
    }
}

// ── Render vehicle cards ──
function renderVehicles(vehicles) {
    vehicleList.innerHTML = "";

    if (!vehicles.length) {
        noVehiclesMessage.style.display = "block";
        noVehiclesMessage.textContent   = dateFilterActive
            ? "No vehicles are available for your selected dates."
            : "No vehicles match your filters.";
        return;
    }
    noVehiclesMessage.style.display = "none";

    vehicles.forEach(vehicle => {
        const card = document.createElement("div");
        card.className = "vehicle-card";

        const isAvailable     = vehicle.availabilityStatus;
        const statusClass     = isAvailable ? "available"  : "unavailable";
        const statusText      = isAvailable ? "Available"  : "Unavailable";
        const bookBtnDisabled = isAvailable ? "" : `disabled title="This vehicle is currently unavailable"`;

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
                    <button class="btn book-btn" onclick="showBookingForm(${vehicle.vehicleId})" ${bookBtnDisabled}>Book Now</button>
                </div>
            </div>`;

        vehicleList.appendChild(card);
    });
}

// ── Booking form ──
function showBookingForm(vehicleId) {
    document.getElementById("vehicleId").value = vehicleId;

    const now           = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                            .toISOString().slice(0, 16);

    document.getElementById("startDate").min = localDateTime;
    document.getElementById("endDate").min   = localDateTime;

    // Pre-fill from date filter if active
    const prefillStart = sessionStorage.getItem("prefillStart");
    const prefillEnd   = sessionStorage.getItem("prefillEnd");
    if (prefillStart) document.getElementById("startDate").value = prefillStart;
    if (prefillEnd)   document.getElementById("endDate").value   = prefillEnd;

    bookingForm.style.display = "block";
    bookingForm.scrollIntoView({ behavior: "smooth" });
}

function cancelBookingForm() {
    document.getElementById("bookVehicleForm").reset();
    bookingForm.style.display = "none";
}

function showBookingError(message) {
    showError(message);
    const errorBox = document.getElementById("pageError");
    if (errorBox) {
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

document.getElementById("startDate").addEventListener("change", function () {
    const endDateInput = document.getElementById("endDate");
    endDateInput.min = this.value;
    if (endDateInput.value && endDateInput.value <= this.value) {
        endDateInput.value = "";
    }
});

document.getElementById("bookVehicleForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const vehicleId = Number(document.getElementById("vehicleId").value);
    const startDate = formatDateTimeLocalToBackend(document.getElementById("startDate").value);
    const endDate   = formatDateTimeLocalToBackend(document.getElementById("endDate").value);

    if (!startDate || !endDate) { showBookingError("Please select both start date and end date."); return; }

    const now   = new Date();
    const start = new Date(startDate);
    const end   = new Date(endDate);

    if (start < now)  { showBookingError("Start date cannot be in the past."); return; }
    if (end <= start) { showBookingError("End date must be after start date."); return; }

    try {
        await apiRequest("/api/bookings", "POST", { vehicleId, startDate, endDate }, true);
        alert("Booking confirmed successfully!", "success");
        cancelBookingForm();
        sessionStorage.removeItem("prefillStart");
        sessionStorage.removeItem("prefillEnd");
        loadVehicles();
    } catch (error) {
        showBookingError(error.message);
    }
});

loadVehicles();