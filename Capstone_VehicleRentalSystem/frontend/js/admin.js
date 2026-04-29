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

// ── DOM references ──────────────────────────────────────────
const vehicleList       = document.getElementById("vehicleList");
const bookingList       = document.getElementById("bookingList");
const noVehiclesMessage = document.getElementById("noVehiclesMessage");
const noBookingsMessage = document.getElementById("noBookingsMessage");

/* ============================================================
   SECTION VISIBILITY HELPERS
   ============================================================ */

/**
 * Hides every major content section so only one is shown at a time.
 */
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

/**
 * Shows the per-vehicle bookings section and triggers a data load.
 *
 * @param {number} vehicleId   - ID of the vehicle whose bookings to display.
 * @param {string} vehicleName - Display name shown in the section heading.
 */
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

/* ============================================================
   VEHICLE LIST
   ============================================================ */

/**
 * Fetches all vehicles from the API and renders them as cards.
 * Each card provides View Bookings, Update, and Delete actions.
 */
async function loadVehicles() {
  clearError();
  vehicleList.innerHTML = "";

  try {
    const vehicles = await apiRequest("/api/vehicles", "GET");

    if (!vehicles.length) {
      noVehiclesMessage.style.display = "block";
      return;
    }

    noVehiclesMessage.style.display = "none";

    vehicles.forEach((vehicle) => {
      const card = document.createElement("div");
      card.className = "vehicle-card";

      const statusClass = vehicle.availabilityStatus ? "available" : "unavailable";
      const statusText  = vehicle.availabilityStatus ? "Available"  : "Unavailable";

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
  } catch (error) {
    showError(error.message);
  }
}

/* ============================================================
   ALL BOOKINGS  (admin view)
   ============================================================ */

/**
 * Fetches every booking in the system and renders them as cards.
 * Admins can cancel any booking whose start date is in the future.
 */
async function loadBookings() {
  bookingList.innerHTML = "";

  try {
    const bookings = await apiRequest("/api/bookings/all", "GET", null, true);

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

/* ============================================================
   VEHICLE BOOKINGS  (per-vehicle admin view)
   ============================================================ */

/**
 * Fetches bookings for a specific vehicle and renders them as cards.
 * Admins can cancel any booking whose start date is in the future.
 *
 * @param {number} vehicleId - The ID of the vehicle to load bookings for.
 */
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

/* ============================================================
   CANCEL BOOKING  (admin action)
   ============================================================ */

/**
 * Cancels a booking via the API and updates the UI in place.
 *
 * The backend already permits admins to cancel any booking that has not yet
 * started (BookingService.cancelBooking checks ownership OR admin role).
 *
 * @param {number} bookingId - The ID of the booking to cancel.
 * @param {HTMLElement} card - The card element to update after success.
 */
async function cancelBooking(bookingId, card) {
  if (!confirm("Are you sure you want to cancel this booking on behalf of the user?")) return;

  try {
    await apiRequest(`/api/bookings/${bookingId}`, "DELETE", null, true);

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
  } catch (error) {
    showError(error.message || "Failed to cancel booking.");
  }
}

/* ============================================================
   VEHICLE FORM HELPERS
   ============================================================ */

/**
 * Pre-fills the Update Vehicle form and switches to that section.
 *
 * @param {string}  vehicleId          - Vehicle primary key.
 * @param {string}  name               - Current vehicle name.
 * @param {string}  type               - Current vehicle type ("Car" | "Bike").
 * @param {string}  description        - Current description text.
 * @param {boolean} availabilityStatus - Current availability flag.
 */
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

/**
 * Sends a DELETE request to remove a vehicle.
 * Asks for confirmation before proceeding.
 *
 * @param {string|number} vehicleId - The ID of the vehicle to delete.
 */
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

/* ============================================================
   FORM SUBMIT HANDLERS
   ============================================================ */

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

/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  // Default to the vehicle list on page load
  showManageVehicles();
  await loadVehicles();
  await loadBookings();
});