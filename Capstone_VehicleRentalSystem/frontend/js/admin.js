/**
 * admin.js — Admin panel logic for NexRide.
 *
 * Handles:
 *  - Vehicle CRUD (add, update, delete)
 *  - Viewing all bookings system-wide
 *  - Viewing bookings per vehicle
 *  - Cancelling any booking that has not yet started (admin privilege)
 *
 * Depends on: scripts.js (apiRequest, escapeHtml, formatDateTime, etc.)
 */

// Guard: redirect non-admins away from this page
requireLogin();
requireAdminPage();

/** Element references and state variables */
const vehicleList       = document.getElementById("vehicleList");
const bookingList       = document.getElementById("bookingList");
const noVehiclesMessage = document.getElementById("noVehiclesMessage");
const noBookingsMessage = document.getElementById("noBookingsMessage");

let allVehicles          = [];
let dateFilteredVehicles = null;
let activeType           = "all";
let activeStatus         = "all";
let dateFilterActive     = false;
let allBookings          = [];
let activeBookingStatus  = "all";

/** Utility function to hide all main sections before showing the selected one */
function hideAllSections() {
  document.getElementById("addVehicleSection").style.display      = "none";
  document.getElementById("updateVehicleSection").style.display   = "none";
  document.getElementById("manageVehiclesSection").style.display  = "none";
  document.getElementById("vehicleBookingsSection").style.display = "none";
  document.getElementById("allBookingsSection").style.display     = "none";
}

/** Shows the Add Vehicle form and updates the active nav link. */
function showAddVehicleForm() {
  clearError();
  hideAllSections();
  document.getElementById("addVehicleSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("add-vehicle");
}

/** Shows the vehicle list section and updates the active nav link. */
function showManageVehicles() {
  clearError();
  hideAllSections();
  document.getElementById("manageVehiclesSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("vehicles");
}

/** Shows the all-bookings section and updates the active nav link. */
function showAllBookings() {
  clearError();
  hideAllSections();
  document.getElementById("allBookingsSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("bookings");
}

/** Shows the bookings for a specific vehicle and updates the active nav link. */
function showVehicleBookings(vehicleId, vehicleName) {
  clearError();
  hideAllSections();
  document.getElementById("vehicleBookingsSection").style.display = "block";
  document.getElementById("vehicleBookingsTitle").textContent = vehicleName;
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("vehicles");
  loadVehicleBookings(vehicleId);
}

/** Resets and hides the Add Vehicle form, then returns to the vehicle list. */
function cancelAdd() {
  document.getElementById("addVehicleForm").reset();
  showManageVehicles();
}

/** Resets and hides the Update Vehicle form, then returns to the vehicle list. */
function cancelUpdate() {
  const form = document.getElementById("updateVehicleForm");
  form.reset();

  const checkbox = document.getElementById("updateAvailabilityStatus");
  checkbox.disabled = false;
  checkbox.title = "";

  showManageVehicles();
}

/* Initializes the minimum values for the date filter inputs to prevent selecting past dates. */
function initDateFilterMinimums() {
  const now   = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  document.getElementById("filterStart").min = local;
  document.getElementById("filterEnd").min   = local;
}

document.getElementById("filterStart").addEventListener("change", function () {
  const endInput = document.getElementById("filterEnd");
  endInput.min = this.value;

  if (endInput.value && endInput.value <= this.value) {
    endInput.value = "";
  }
});

/* Validates the date filter inputs and returns an object with ISO strings if valid, or null if invalid (also shows error messages). */
function getValidDateFilterRange() {
  const startVal = document.getElementById("filterStart").value;
  const endVal   = document.getElementById("filterEnd").value;
  const errEl    = document.getElementById("dateFilterError");

  errEl.style.display = "none";

  if (!startVal || !endVal) {
    errEl.textContent = "Please select both a start and end date.";
    errEl.style.display = "block";
    return null;
  }

  const start = new Date(startVal);
  const end   = new Date(endVal);
  const now   = new Date();

  if (start < now) {
    errEl.textContent = "Start date cannot be in the past.";
    errEl.style.display = "block";
    return null;
  }

  if (end <= start) {
    errEl.textContent = "End date must be after start date.";
    errEl.style.display = "block";
    return null;
  }

  return {
    startIso: `${startVal}:00`,
    endIso: `${endVal}:00`,
  };
}

/* Fetches vehicles available for the specified date range from the API. */
async function fetchVehiclesAvailableForRange(startIso, endIso) {
  return apiRequest(
    `/api/vehicles/available?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`,
    "GET"
  );
}

/* Applies the date filter by fetching available vehicles for the selected range, updating the UI to reflect the active filter, and re-applying all filters to show the results. */
async function applyDateFilter() {
  const range = getValidDateFilterRange();
  const errEl = document.getElementById("dateFilterError");

  if (!range) return;

  try {
    document.getElementById("checkAvailabilityBtn").disabled    = true;
    document.getElementById("checkAvailabilityBtn").textContent = "Checking...";

    dateFilteredVehicles = await fetchVehiclesAvailableForRange(range.startIso, range.endIso);
    dateFilterActive = true;

    document.getElementById("dateFilterBadge").style.display    = "flex";
    document.getElementById("clearDateFilterBtn").style.display = "inline-flex";

    document.querySelectorAll('.chip[data-filter="status"]').forEach((chip) => {
      if (chip.dataset.value === "unavailable") {
        chip.disabled      = true;
        chip.style.opacity = "0.4";
        chip.style.cursor  = "not-allowed";
      }
    });

    if (activeStatus === "unavailable") {
      activeStatus = "all";
      document.querySelectorAll('.chip[data-filter="status"]').forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.value === "all");
      });
    }

    applyFilters();
  } catch (error) {
    errEl.textContent = error.message || "Failed to check availability.";
    errEl.style.display = "block";
  } finally {
    document.getElementById("checkAvailabilityBtn").disabled    = false;
    document.getElementById("checkAvailabilityBtn").textContent = "Check";
  }
}

/* Clears the date filter, resets related UI elements, and re-applies filters to show the full vehicle list. */
function clearDateFilter() {
  dateFilteredVehicles = null;
  dateFilterActive     = false;

  document.getElementById("filterStart").value                = "";
  document.getElementById("filterEnd").value                  = "";
  document.getElementById("dateFilterBadge").style.display    = "none";
  document.getElementById("clearDateFilterBtn").style.display = "none";
  document.getElementById("dateFilterError").style.display    = "none";

  document.querySelectorAll('.chip[data-filter="status"]').forEach((chip) => {
    chip.disabled      = false;
    chip.style.opacity = "";
    chip.style.cursor  = "";
  });

  applyFilters();
}

/* Sets the active type or status filter based on user interaction, then re-applies filters to the vehicle list. */
function setChip(el, group) {
  document.querySelectorAll(`.chip[data-filter="${group}"]`)
    .forEach((chip) => chip.classList.remove("active"));

  el.classList.add("active");

  if (group === "type")   activeType   = el.dataset.value;
  if (group === "status") activeStatus = el.dataset.value;

  applyFilters();
}

/* Resets all filters (type, status, name, and date) to their default states and re-renders the full vehicle list. */
function resetFilters() {
  document.getElementById("searchInput").value = "";
  activeType   = "all";
  activeStatus = "all";

  document.querySelectorAll('.chip[data-filter="type"], .chip[data-filter="status"]').forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.value === "all");
  });

  clearDateFilter();
}

/* Applies the active type, status, name, and date filters to the vehicle list, then renders the results. */
function applyFilters() {
  const query    = document.getElementById("searchInput").value.trim().toLowerCase();
  const baseList = dateFilterActive ? dateFilteredVehicles : allVehicles;
  const vehicles = Array.isArray(baseList) ? baseList : [];

  const filtered = vehicles.filter((vehicle) => {
    const matchType = activeType === "all" || vehicle.type === activeType;
    const matchStatus =
      dateFilterActive       ? true :
      activeStatus === "all" ? true :
      activeStatus === "available"
        ? vehicle.availabilityStatus === true
        : vehicle.availabilityStatus === false;
    const matchName = !query || String(vehicle.name || "").toLowerCase().includes(query);

    return matchType && matchStatus && matchName;
  });

  renderVehicles(filtered);

  const countEl     = document.getElementById("filterCount");
  const totalBase   = dateFilterActive ? vehicles.length : allVehicles.length;
  const isFiltering = activeType !== "all" || activeStatus !== "all" || query || dateFilterActive;

  if (isFiltering) {
    countEl.textContent = dateFilterActive
      ? `${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""} available for selected dates`
      : `Showing ${filtered.length} of ${totalBase} vehicle${totalBase !== 1 ? "s" : ""}`;
    countEl.style.display = "block";
  } else {
    countEl.style.display = "none";
  }
}

/**
 * Fetches all vehicles from the API and renders them through the active filters.
 */
async function loadVehicles() {
  clearError();
  vehicleList.innerHTML = "";

  try {
    allVehicles = await apiRequest("/api/vehicles", "GET");

    if (dateFilterActive) {
      const startVal = document.getElementById("filterStart").value;
      const endVal   = document.getElementById("filterEnd").value;

      if (startVal && endVal) {
        dateFilteredVehicles = await fetchVehiclesAvailableForRange(`${startVal}:00`, `${endVal}:00`);
      }
    }

    applyFilters();
  } catch (error) {
    showError(error.message);
  }
}

/**
 * Renders vehicle cards. Each card provides View Bookings, Update, and Delete actions.
 */
function renderVehicles(vehicles) {
  vehicleList.innerHTML = "";

  if (!vehicles.length) {
    noVehiclesMessage.style.display = "block";
    noVehiclesMessage.textContent = dateFilterActive
      ? "No vehicles are available for your selected dates."
      : "No vehicles match your filters.";
    return;
  }

  noVehiclesMessage.style.display = "none";

    vehicles.forEach((vehicle) => {
      const card = document.createElement("div");
      card.className = "vehicle-card";

      const isAvailable = dateFilterActive ? true : vehicle.availabilityStatus;
      const statusClass = isAvailable ? "available" : "unavailable";
      const statusText  = isAvailable ? "Available"  : "Unavailable";

      card.innerHTML = `
        <img src="${getVehicleImage(vehicle.type)}" alt="${escapeHtml(vehicle.name)}" class="vehicle-image">
        <h3>${escapeHtml(vehicle.name)}</h3>
        <p><strong>Type:</strong> ${escapeHtml(vehicle.type)}</p>
        <p><strong>Description:</strong> ${escapeHtml(vehicle.description || "No description")}</p>
        <span class="status-pill ${statusClass}">${statusText}</span>
        <div class="card-actions">
          <button class="btn view-bookings-btn"
                  data-vehicle-id="${vehicle.vehicleId}"
                  data-vehicle-name="${escapeHtml(vehicle.name)}">
            View Bookings
          </button>
          <button class="btn update-btn"
                  data-vehicle-id="${vehicle.vehicleId}"
                  data-vehicle-name="${escapeHtml(vehicle.name)}"
                  data-vehicle-type="${escapeHtml(vehicle.type)}"
                  data-vehicle-description="${escapeHtml(vehicle.description || "")}"
                  data-vehicle-status="${vehicle.availabilityStatus}">
            Update
          </button>
          <button class="btn btn-danger delete-btn"
                  data-vehicle-id="${vehicle.vehicleId}">
            Delete
          </button>
        </div>
      `;

      vehicleList.appendChild(card);

      // View Bookings button
      card.querySelector(".view-bookings-btn").addEventListener("click", () => {
        const vid  = card.querySelector(".view-bookings-btn").getAttribute("data-vehicle-id");
        const name = card.querySelector(".view-bookings-btn").getAttribute("data-vehicle-name");
        showVehicleBookings(vid, name);
      });

      // Update button — pre-fills the update form
      card.querySelector(".update-btn").addEventListener("click", () => {
        const btn = card.querySelector(".update-btn");
        showUpdateForm(
          btn.getAttribute("data-vehicle-id"),
          btn.getAttribute("data-vehicle-name"),
          btn.getAttribute("data-vehicle-type"),
          btn.getAttribute("data-vehicle-description"),
          btn.getAttribute("data-vehicle-status") === "true"
        );
      });

      // Delete button
      card.querySelector(".delete-btn").addEventListener("click", async () => {
        const vid = card.querySelector(".delete-btn").getAttribute("data-vehicle-id");
        await deleteVehicle(vid);
      });
    });
}

/**
 * Fetches every booking in the system and renders them as cards.
 * Admins can cancel any booking whose start date is in the future.
 */
async function loadBookings() {
  bookingList.innerHTML = "";

  try {
    const bookings = await apiRequest("/api/bookings/all", "GET", null, true);
    allBookings = bookings;

    if (!bookings.length) {
      noBookingsMessage.style.display = "block";
      return;
    }

    noBookingsMessage.style.display = "none";

    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "booking-card";

      // Determine whether this booking is still cancellable
      const startDate           = new Date(booking.startDate);
      const now                 = new Date();
      const isPendingOrConfirmed = booking.status === "PENDING" || booking.status === "CONFIRMED";
      const isStartInFuture     = startDate > now;
      const canCancel           = isPendingOrConfirmed && isStartInFuture;

      // Build the cancel button — disabled with a tooltip when not cancellable
      let cancelBtnHtml = `<button class="btn btn-danger cancel-booking-btn"
                              data-booking-id="${booking.bookingId}"`;
      if (!canCancel) {
        let reason = "";
        if (!isPendingOrConfirmed) {
          reason = "Only PENDING or CONFIRMED bookings can be cancelled";
        } else if (!isStartInFuture) {
          reason = "Booking has already started or passed";
        }
        cancelBtnHtml += ` disabled title="${reason}"`;
      }
      cancelBtnHtml += `>Cancel Booking</button>`;

      card.innerHTML = `
        <img src="${getVehicleImage(booking.type || "car")}"
             alt="${escapeHtml(booking.vehicleName)}"
             class="vehicle-image">
        <div class="booking-main">
          <h3>${escapeHtml(booking.vehicleName)}</h3>
          <p><strong>User:</strong> ${escapeHtml(booking.username)}</p>
          <p><strong>Vehicle ID:</strong> ${booking.vehicleId}</p>
          <p><strong>Start Date:</strong> ${formatDateTime(booking.startDate)}</p>
          <p><strong>End Date:</strong>   ${formatDateTime(booking.endDate)}</p>
        </div>
        <div class="booking-actions">
          <span class="status-pill ${booking.status.toLowerCase()}">${escapeHtml(booking.status)}</span>
          ${cancelBtnHtml}
        </div>
      `;

      bookingList.appendChild(card);

      // Attach cancel listener only when the action is permitted
      if (canCancel) {
        card.querySelector(".cancel-booking-btn").addEventListener("click", () =>
          cancelBooking(booking.bookingId, card)
        );
      }
    });
  } catch (error) {
    showError(error.message);
  }
}

/* Sets the active booking status filter and re-applies filters to the booking list. */
function setBookingStatusFilter(el) {
  document.querySelectorAll('.chip[data-filter="booking-status"]')
    .forEach((chip) => chip.classList.remove("active"));

  el.classList.add("active");
  activeBookingStatus = el.dataset.value;
  applyBookingFilters();
}

/* Filters the all-bookings list based on the selected status. Shows a count of matching bookings when a filter is active. */
function applyBookingFilters() {
  const filtered = activeBookingStatus === "all"
    ? allBookings
    : allBookings.filter((booking) => booking.status === activeBookingStatus);

  renderBookings(filtered);

  const countEl = document.getElementById("bookingFilterCount");
  if (activeBookingStatus === "all") {
    countEl.style.display = "none";
    return;
  }

  countEl.textContent = `Showing ${filtered.length} of ${allBookings.length} booking${allBookings.length !== 1 ? "s" : ""}`;
  countEl.style.display = "block";
}

/* Renders booking cards based on the provided list. Shows a message if no bookings match the filter. */
function renderBookings(bookings) {
  bookingList.innerHTML = "";

  if (!bookings.length) {
    noBookingsMessage.style.display = "block";
    noBookingsMessage.textContent = activeBookingStatus === "all"
      ? "No bookings available."
      : `No ${activeBookingStatus.toLowerCase()} bookings available.`;
    return;
  }

  noBookingsMessage.style.display = "none";

  bookings.forEach((booking) => {
    const card = document.createElement("div");
    card.className = "booking-card";

    const startDate            = new Date(booking.startDate);
    const now                  = new Date();
    const isPendingOrConfirmed = booking.status === "PENDING" || booking.status === "CONFIRMED";
    const isStartInFuture      = startDate > now;
    const canCancel            = isPendingOrConfirmed && isStartInFuture;

    let cancelBtnHtml = `<button class="btn btn-danger cancel-booking-btn"
                            data-booking-id="${booking.bookingId}"`;
    if (!canCancel) {
      let reason = "";
      if (!isPendingOrConfirmed) {
        reason = "Only PENDING or CONFIRMED bookings can be cancelled";
      } else if (!isStartInFuture) {
        reason = "Booking has already started or passed";
      }
      cancelBtnHtml += ` disabled title="${reason}"`;
    }
    cancelBtnHtml += `>Cancel Booking</button>`;

    card.innerHTML = `
      <img src="${getVehicleImage(booking.type || "car")}"
           alt="${escapeHtml(booking.vehicleName)}"
           class="vehicle-image">
      <div class="booking-main">
        <h3>${escapeHtml(booking.vehicleName)}</h3>
        <p><strong>User:</strong> ${escapeHtml(booking.username)}</p>
        <p><strong>Vehicle ID:</strong> ${booking.vehicleId}</p>
        <p><strong>Start Date:</strong> ${formatDateTime(booking.startDate)}</p>
        <p><strong>End Date:</strong>   ${formatDateTime(booking.endDate)}</p>
      </div>
      <div class="booking-actions">
        <span class="status-pill ${booking.status.toLowerCase()}">${escapeHtml(booking.status)}</span>
        ${cancelBtnHtml}
      </div>
    `;

    bookingList.appendChild(card);

    if (canCancel) {
      card.querySelector(".cancel-booking-btn").addEventListener("click", () =>
        cancelBooking(booking.bookingId, card)
      );
    }
  });
}

/* Loads bookings for a specific vehicle and renders them. Admins can cancel any booking that has not yet started. */
async function loadVehicleBookings(vehicleId) {
  const vehicleBookingList        = document.getElementById("vehicleBookingList");
  const noVehicleBookingsMessage  = document.getElementById("noVehicleBookingsMessage");

  vehicleBookingList.innerHTML = "";

  try {
    const bookings = await apiRequest(`/api/bookings/vehicle/${vehicleId}`, "GET", null, true);

    if (!bookings.length) {
      noVehicleBookingsMessage.style.display = "block";
      return;
    }

    noVehicleBookingsMessage.style.display = "none";

    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "booking-card";

      // Determine whether this booking is still cancellable
      const startDate            = new Date(booking.startDate);
      const now                  = new Date();
      const isPendingOrConfirmed = booking.status === "PENDING" || booking.status === "CONFIRMED";
      const isStartInFuture      = startDate > now;
      const canCancel            = isPendingOrConfirmed && isStartInFuture;

      // Build the cancel button
      let cancelBtnHtml = `<button class="btn btn-danger cancel-booking-btn"
                              data-booking-id="${booking.bookingId}"`;
      if (!canCancel) {
        let reason = "";
        if (!isPendingOrConfirmed) {
          reason = "Only PENDING or CONFIRMED bookings can be cancelled";
        } else if (!isStartInFuture) {
          reason = "Booking has already started or passed";
        }
        cancelBtnHtml += ` disabled title="${reason}"`;
      }
      cancelBtnHtml += `>Cancel Booking</button>`;

      card.innerHTML = `
        <img src="${getVehicleImage(booking.type || "car")}"
             alt="${escapeHtml(booking.vehicleName)}"
             class="vehicle-image">
        <div class="booking-main">
          <h3>${escapeHtml(booking.vehicleName)}</h3>
          <p><strong>User:</strong>      ${escapeHtml(booking.username)}</p>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Start Date:</strong> ${formatDateTime(booking.startDate)}</p>
          <p><strong>End Date:</strong>   ${formatDateTime(booking.endDate)}</p>
        </div>
        <div class="booking-actions">
          <span class="status-pill ${booking.status.toLowerCase()}">${escapeHtml(booking.status)}</span>
          ${cancelBtnHtml}
        </div>
      `;

      vehicleBookingList.appendChild(card);

      // Attach cancel listener only when the action is permitted
      if (canCancel) {
        card.querySelector(".cancel-booking-btn").addEventListener("click", () =>
          cancelBooking(booking.bookingId, card)
        );
      }
    });
  } catch (error) {
    showError(error.message);
  }
}

/* Cancels a booking by ID, then updates the UI to reflect the change without a full reload. */
async function cancelBooking(bookingId, card) {
  if (!confirm("Are you sure you want to cancel this booking on behalf of the user?")) return;

  try {
    await apiRequest(`/api/bookings/${bookingId}`, "DELETE", null, true);

    const storedBooking = allBookings.find((booking) => Number(booking.bookingId) === Number(bookingId));
    if (storedBooking) {
      storedBooking.status = "CANCELLED";
    }

    // Update the status pill in place — no full page reload needed
    const pill = card.querySelector(".status-pill");
    if (pill) {
      pill.textContent  = "CANCELLED";
      pill.className    = "status-pill cancelled";
    }

    // Disable the cancel button so it cannot be clicked again
    const btn = card.querySelector(".cancel-booking-btn");
    if (btn) {
      btn.disabled = true;
      btn.title    = "Booking has been cancelled";
    }

    alert("Booking cancelled successfully.");

    if (document.getElementById("allBookingsSection").style.display !== "none") {
      applyBookingFilters();
    }
  } catch (error) {
    showError(error.message || "Failed to cancel booking.");
  }
}

/* Shows the Update Vehicle form pre-filled with the selected vehicle's data. */
function showUpdateForm(vehicleId, name, type, description, availabilityStatus) {
  clearError();
  hideAllSections();
  document.getElementById("updateVehicleSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("vehicles");

  document.getElementById("updateVehicleId").value          = vehicleId;
  document.getElementById("updateName").value               = name;
  document.getElementById("updateType").value               = type;
  document.getElementById("updateDescription").value        = description;
  document.getElementById("updateAvailabilityStatus").checked  = availabilityStatus;
  document.getElementById("updateAvailabilityStatus").disabled = false;
  document.getElementById("updateAvailabilityStatus").title    = "";
}

/* Deletes a vehicle after confirmation, then refreshes the vehicle list. */
async function deleteVehicle(vehicleId) {
  if (!vehicleId) { showError("Vehicle ID is missing."); return; }

  if (!confirm("Are you sure you want to delete this vehicle?")) return;

  clearError();

  try {
    await apiRequest(`/api/admin/vehicles/${vehicleId}`, "DELETE", null, true);
    alert("Vehicle deleted successfully.");
    await loadVehicles();
    showManageVehicles();
  } catch (error) {
    showError(error.message || "Failed to delete vehicle.");
  }
}

/** Handles the Add Vehicle form submission. */
document.getElementById("addVehicleForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const vehicleData = {
    name:               document.getElementById("name").value.trim(),
    type:               document.getElementById("type").value.trim(),
    description:        document.getElementById("description").value.trim(),
    availabilityStatus: document.getElementById("availabilityStatus").checked,
  };

  try {
    await apiRequest("/api/admin/vehicles", "POST", vehicleData, true);
    alert("Vehicle added successfully.");
    document.getElementById("addVehicleForm").reset();
    await loadVehicles();
    showManageVehicles();
  } catch (error) {
    showError(error.message);
  }
});

/** Handles the Update Vehicle form submission. */
document.getElementById("updateVehicleForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const vehicleId   = document.getElementById("updateVehicleId").value;
  const vehicleData = {
    name:               document.getElementById("updateName").value.trim(),
    type:               document.getElementById("updateType").value.trim(),
    description:        document.getElementById("updateDescription").value.trim(),
    availabilityStatus: document.getElementById("updateAvailabilityStatus").checked,
  };

  try {
    await apiRequest(`/api/admin/vehicles/${vehicleId}`, "PUT", vehicleData, true);

    // Reset form state
    document.getElementById("updateVehicleForm").reset();
    document.getElementById("updateAvailabilityStatus").disabled = false;
    document.getElementById("updateAvailabilityStatus").title    = "";

    alert("Vehicle updated successfully.");
    await loadVehicles();
    showManageVehicles();
  } catch (error) {
    showError(error.message);
  }
});


/* INITIALIZATION */
document.addEventListener("DOMContentLoaded", async () => {
  // Default to the vehicle list on page load
  initDateFilterMinimums();
  showManageVehicles();
  await loadVehicles();
  await loadBookings();
});
