requireLogin();
requireAdminPage();

const vehicleList = document.getElementById("vehicleList");
const bookingList = document.getElementById("bookingList");
const noVehiclesMessage = document.getElementById("noVehiclesMessage");
const noBookingsMessage = document.getElementById("noBookingsMessage");

function hideAllSections() {
  document.getElementById("addVehicleSection").style.display = "none";
  document.getElementById("updateVehicleSection").style.display = "none";
  document.getElementById("manageVehiclesSection").style.display = "none";
  document.getElementById("vehicleBookingsSection").style.display = "none";
  document.getElementById("allBookingsSection").style.display = "none";
}

function showAddVehicleForm() {
  clearError();
  hideAllSections();
  document.getElementById("addVehicleSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("add-vehicle");
}

function showManageVehicles() {
  clearError();
  hideAllSections();
  document.getElementById("manageVehiclesSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("vehicles");
}

function showAllBookings() {
  clearError();
  hideAllSections();
  document.getElementById("allBookingsSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("bookings");
}

function showVehicleBookings(vehicleId, vehicleName) {
  clearError();
  hideAllSections();
  document.getElementById("vehicleBookingsSection").style.display = "block";
  document.getElementById("vehicleBookingsTitle").textContent = vehicleName;
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("vehicles");
  loadVehicleBookings(vehicleId);
}

function cancelAdd() {
  document.getElementById("addVehicleForm").reset();
  showManageVehicles();
}

function cancelUpdate() {
  const form = document.getElementById("updateVehicleForm");
  form.reset();

  const checkbox = document.getElementById("updateAvailabilityStatus");
  checkbox.disabled = false;
  checkbox.title = "";

  showManageVehicles();
}

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
      const statusText = vehicle.availabilityStatus ? "Available" : "Unavailable";

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

      const viewBookingsBtn = card.querySelector(".view-bookings-btn");
      if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener("click", () => {
          const vehicleId = viewBookingsBtn.getAttribute("data-vehicle-id");
          const vehicleName = viewBookingsBtn.getAttribute("data-vehicle-name");
          showVehicleBookings(vehicleId, vehicleName);
        });
      }

      const updateBtn = card.querySelector(".update-btn");
      if (updateBtn) {
        updateBtn.addEventListener("click", () => {
          const vehicleId = updateBtn.getAttribute("data-vehicle-id");
          const name = updateBtn.getAttribute("data-vehicle-name");
          const type = updateBtn.getAttribute("data-vehicle-type");
          const description = updateBtn.getAttribute("data-vehicle-description");
          const availabilityStatus = updateBtn.getAttribute("data-vehicle-status") === "true";

          showUpdateForm(vehicleId, name, type, description, availabilityStatus);
        });
      }

      const deleteBtn = card.querySelector(".delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          const vehicleId = deleteBtn.getAttribute("data-vehicle-id");
          await deleteVehicle(vehicleId);
        });
      }
    });
  } catch (error) {
    showError(error.message);
  }
}

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

      card.innerHTML = `
        <img src="${getVehicleImage(booking.type || "car")}" alt="${escapeHtml(booking.vehicleName)}" class="vehicle-image">
        <div class="booking-main">
          <h3>${escapeHtml(booking.vehicleName)}</h3>
          <p><strong>User:</strong> ${escapeHtml(booking.username)}</p>
          <p><strong>Vehicle ID:</strong> ${booking.vehicleId}</p>
          <p><strong>Start Date:</strong> ${formatDateTime(booking.startDate)}</p>
          <p><strong>End Date:</strong> ${formatDateTime(booking.endDate)}</p>
        </div>
        <div class="booking-actions">
          <span class="status-pill ${booking.status.toLowerCase()}">${escapeHtml(booking.status)}</span>
        </div>
      `;

      bookingList.appendChild(card);
    });
  } catch (error) {
    showError(error.message);
  }
}

async function loadVehicleBookings(vehicleId) {
  const vehicleBookingList = document.getElementById("vehicleBookingList");
  const noVehicleBookingsMessage = document.getElementById("noVehicleBookingsMessage");

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

      card.innerHTML = `
        <img src="${getVehicleImage(booking.type || "car")}" alt="${escapeHtml(booking.vehicleName)}" class="vehicle-image">
        <div class="booking-main">
          <h3>${escapeHtml(booking.vehicleName)}</h3>
          <p><strong>User:</strong> ${escapeHtml(booking.username)}</p>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Start Date:</strong> ${formatDateTime(booking.startDate)}</p>
          <p><strong>End Date:</strong> ${formatDateTime(booking.endDate)}</p>
        </div>
        <div class="booking-actions">
          <span class="status-pill ${booking.status.toLowerCase()}">${escapeHtml(booking.status)}</span>
        </div>
      `;

      vehicleBookingList.appendChild(card);
    });
  } catch (error) {
    showError(error.message);
  }
}

function showUpdateForm(vehicleId, name, type, description, availabilityStatus) {
  clearError();
  hideAllSections();
  document.getElementById("updateVehicleSection").style.display = "block";
  if (typeof setActiveAdminNav === "function") setActiveAdminNav("vehicles");

  document.getElementById("updateVehicleId").value = vehicleId;
  document.getElementById("updateName").value = name;
  document.getElementById("updateType").value = type;
  document.getElementById("updateDescription").value = description;

  const checkbox = document.getElementById("updateAvailabilityStatus");
  checkbox.checked = availabilityStatus;

  if (!availabilityStatus) {
    checkbox.disabled = true;
    checkbox.title = "Booked vehicles cannot have availability changed manually";
  } else {
    checkbox.disabled = false;
    checkbox.title = "";
  }
}

async function deleteVehicle(vehicleId) {
  if (!vehicleId) {
    showError("Vehicle ID is missing.");
    return;
  }

  const confirmed = confirm("Are you sure you want to delete this vehicle?");
  if (!confirmed) return;

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

document.getElementById("addVehicleForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const vehicleData = {
    name: document.getElementById("name").value.trim(),
    type: document.getElementById("type").value.trim(),
    description: document.getElementById("description").value.trim(),
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

document.getElementById("updateVehicleForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const vehicleId = document.getElementById("updateVehicleId").value;
  const vehicleData = {
    name: document.getElementById("updateName").value.trim(),
    type: document.getElementById("updateType").value.trim(),
    description: document.getElementById("updateDescription").value.trim(),
    availabilityStatus: document.getElementById("updateAvailabilityStatus").checked,
  };

  try {
    await apiRequest(`/api/admin/vehicles/${vehicleId}`, "PUT", vehicleData, true);

    document.getElementById("updateVehicleForm").reset();

    const checkbox = document.getElementById("updateAvailabilityStatus");
    checkbox.disabled = false;
    checkbox.title = "";

    alert("Vehicle updated successfully.");
    await loadVehicles();
    showManageVehicles();
  } catch (error) {
    showError(error.message);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  showManageVehicles();
  await loadVehicles();
  await loadBookings();
});