package com.example.backend.dto.response;
import java.time.LocalDateTime;

public class VehicleResponseDto {

    private Long vehicleId;
    private String name;
    private String type;
    private String description;
    private boolean availabilityStatus;
    private Long addedByUserId;
    private String addedByUsername;
    private LocalDateTime createdAt;

    public VehicleResponseDto(Long vehicleId, String name, String type, String description,
                              boolean availabilityStatus, Long addedByUserId,
                              String addedByUsername, LocalDateTime createdAt) {
        this.vehicleId = vehicleId;
        this.name = name;
        this.type = type;
        this.description = description;
        this.availabilityStatus = availabilityStatus;
        this.addedByUserId = addedByUserId;
        this.addedByUsername = addedByUsername;
        this.createdAt = createdAt;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public boolean isAvailabilityStatus() {
        return availabilityStatus;
    }

    public Long getAddedByUserId() {
        return addedByUserId;
    }

    public String getAddedByUsername() {
        return addedByUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}