requireLogin();
showAdminNavIfNeeded();
const bookingList = document.getElementById("bookingList");
const noBookingsMessage = document.getElementById("noBookingsMessage");
async function loadBookings() {

  clearError();

  bookingList.innerHTML = "";

  try {
    const bookings = await apiRequest(
      "/api/bookings/my-bookings",
      "GET",
      null,
      true,
    );

    console.log("Bookings loaded:", bookings);

    if (!bookings.length) {
      noBookingsMessage.style.display = "block";
      return;
    }

    noBookingsMessage.style.display = "none";

    bookings.forEach((booking) => {
      const startDate = new Date(booking.startDate);
      const now = new Date();
      const isPendingOrConfirmed =
        booking.status === "PENDING" || booking.status === "CONFIRMED";
      const isDateInFuture = startDate > now;
      const canCancel = isPendingOrConfirmed && isDateInFuture;
      console.log(`Booking ${booking.bookingId}:`, {
        status: booking.status,
        startDate: startDate.toISOString(),
        now: now.toISOString(),
        isPendingOrConfirmed,
        isDateInFuture,
        canCancel,
      });

      const card = document.createElement("div");
      card.className = "booking-card";

      let buttonHtml =
        '<button class="btn btn-danger cancel-btn" data-booking-id="' +
        booking.bookingId +
        '"';
      if (!canCancel) {
        let reason = "";
        if (!isPendingOrConfirmed) {
          reason = "Only PENDING or CONFIRMED bookings can be cancelled";
        } else if (!isDateInFuture) {
          reason = "Booking has already started or passed";
        }
        buttonHtml += ' disabled title="' + reason + '"';
      }
      buttonHtml += ">Cancel</button>";

      card.innerHTML = `
                <img src="${getVehicleImage(booking.type)}" alt="${escapeHtml(booking.vehicleName)}" class="vehicle-image">
                <div class="booking-main">
                    <h3>${escapeHtml(booking.vehicleName)}</h3>
                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                    <p><strong>Start Date:</strong> ${formatDateTime(booking.startDate)}</p>
                    <p><strong>End Date:</strong> ${formatDateTime(booking.endDate)}</p>
                    <p><strong>Vehicle ID:</strong> ${booking.vehicleId}</p>
                </div>
                <div class="booking-actions">
                    <span class="status-pill ${booking.status.toLowerCase()}">${escapeHtml(booking.status)}</span>
                    ${buttonHtml}
                </div>`;
      bookingList.appendChild(card);

      // Attach event listener to cancel button
      const cancelBtn = card.querySelector(".cancel-btn");
      if (cancelBtn && canCancel) {
        cancelBtn.addEventListener("click", () =>
          cancelBooking(booking.bookingId),
        );
      }
    });
  }
   catch (error) {
    showError(error.message);
  }
}

async function cancelBooking(bookingId) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  try {
    await apiRequest(`/api/bookings/${bookingId}`, "DELETE", null, true);
    alert("Booking cancelled successfully.");
    loadBookings();
  } catch (error) {
    showError(error.message);
  }
}

loadBookings();

function getVehicleImage(type) {
  if (!type) return "img/car.png";

  const t = type.toLowerCase();

  if (t === "car") return "img/car3.png";
  if (t === "bike") return "img/bike.png";

  return "img/car.png"; // fallback
}
