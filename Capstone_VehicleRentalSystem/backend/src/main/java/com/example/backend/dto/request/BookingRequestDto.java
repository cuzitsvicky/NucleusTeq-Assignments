package com.example.backend.dto.request;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object for booking requests. Contains the necessary information to create a new booking,
 * including the vehicle ID, start date, and end date of the booking.
 */
public class BookingRequestDto {
    @NotNull(message = "Vehicle id is required")
    private Long vehicleId;
    @NotNull(message = "Start date is required")
    private String startDate;
    @NotNull(message = "End date is required")
    private String endDate;

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
