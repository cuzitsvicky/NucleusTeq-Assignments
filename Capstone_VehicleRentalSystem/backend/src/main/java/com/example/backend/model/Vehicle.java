package com.example.backend.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/****
 * Entity representing a vehicle in the rental system. Contains information about the vehicle's name, type (CAR or BIKE),
 * description, availability status, the user who added it to the system, and the creation timestamp. This entity is
 * used to manage the inventory of vehicles available for booking.
 */
@Entity
@Table(name = "vehicles")
public class Vehicle {

    // Vehicle types for categorization
    public enum VehicleType {
        CAR,
        BIKE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean availabilityStatus = true;
    
    /**
     * Many-to-one relationship with User entity to track which admin added the vehicle
     * Shows who added the vehicle to the system
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", nullable = false)
    private User addedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VehicleType getType() {
        return type;
    }

    public void setType(VehicleType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(boolean availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public User getAddedBy() {
        return addedBy;
    }

    public void setAddedBy(User addedBy) {
        this.addedBy = addedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}