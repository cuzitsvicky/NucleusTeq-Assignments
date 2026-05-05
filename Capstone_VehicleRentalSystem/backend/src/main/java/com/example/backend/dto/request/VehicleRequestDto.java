package com.example.backend.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Data Transfer Object for vehicle requests. Contains the necessary information to create or update a vehicle,
 * including the vehicle name, type, description, and availability status. The name and type fields are required,
 * with the type field restricted to either "Car" or "Bike". The description and availability status are optional.
 */
public class VehicleRequestDto {

    @NotBlank(message = "Vehicle name is required")
    private String name;

    @NotBlank(message = "Vehicle type is required")
    @Pattern(regexp = "^(Car|Bike)$", message = "Vehicle type must be either Car or Bike")
    private String type;

    private String description;

    private Boolean availabilityStatus;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(Boolean availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
}