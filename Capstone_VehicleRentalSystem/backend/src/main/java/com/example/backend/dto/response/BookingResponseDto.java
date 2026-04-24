package com.example.backend.dto.response;
import java.time.LocalDateTime;

public class BookingResponseDto {
    private Long bookingId;
    private Long userId;
    private String username;
    private Long vehicleId;
    private String vehicleName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private LocalDateTime createdAt;
    private String type;

    public BookingResponseDto(Long bookingId, Long userId, String username,
            Long vehicleId, String vehicleName, String type,
            LocalDateTime startDate, LocalDateTime endDate,
            String status, LocalDateTime createdAt) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.username = username;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getType() {
        return type;
    }
    

    public Long getVehicleId() {
        return vehicleId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
