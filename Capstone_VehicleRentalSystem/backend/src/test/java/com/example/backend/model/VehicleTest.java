package com.example.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

class VehicleTest {

    private Vehicle vehicle;
    private User admin;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setUserId(1L);
        admin.setUsername("admin_user");
        admin.setEmail("admin@example.com");

        vehicle = new Vehicle();
    }

    // ── getters and setters ─────────────────────────────────

    @Test
    void vehicleId_canBeSet_andRetrieved() {
        vehicle.setVehicleId(1L);

        assertThat(vehicle.getVehicleId()).isEqualTo(1L);
    }

    @Test
    void name_canBeSet_andRetrieved() {
        vehicle.setName("Honda City");

        assertThat(vehicle.getName()).isEqualTo("Honda City");
    }

    @Test
    void type_canBeSet_andRetrieved() {
        vehicle.setType(Vehicle.VehicleType.CAR);

        assertThat(vehicle.getType()).isEqualTo(Vehicle.VehicleType.CAR);
    }

    @Test
    void description_canBeSet_andRetrieved() {
        vehicle.setDescription("Comfortable sedan for city driving");

        assertThat(vehicle.getDescription()).isEqualTo("Comfortable sedan for city driving");
    }

    @Test
    void description_canBeNull() {
        vehicle.setDescription(null);

        assertThat(vehicle.getDescription()).isNull();
    }

    @Test
    void availabilityStatus_canBeSet_andRetrieved() {
        vehicle.setAvailabilityStatus(true);

        assertThat(vehicle.isAvailabilityStatus()).isTrue();

        vehicle.setAvailabilityStatus(false);

        assertThat(vehicle.isAvailabilityStatus()).isFalse();
    }

    @Test
    void availabilityStatus_defaultsToTrue() {
        assertThat(vehicle.isAvailabilityStatus()).isTrue();
    }

    @Test
    void addedBy_canBeSet_andRetrieved() {
        vehicle.setAddedBy(admin);

        assertThat(vehicle.getAddedBy()).isEqualTo(admin);
        assertThat(vehicle.getAddedBy().getUsername()).isEqualTo("admin_user");
    }

    @Test
    void createdAt_isNotNullByDefault() {
        assertThat(vehicle.getCreatedAt()).isNotNull();
    }

    @Test
    void createdAt_isSetToCurrentTimeByDefault() {
        LocalDateTime before = LocalDateTime.now();
        Vehicle v = new Vehicle();
        LocalDateTime after = LocalDateTime.now();

        assertThat(v.getCreatedAt()).isAfterOrEqualTo(before);
        assertThat(v.getCreatedAt()).isBeforeOrEqualTo(after.plusSeconds(1));
    }

    // ── vehicle type enum ───────────────────────────────────

    @Test
    void vehicleType_hasCarValue() {
        assertThat(Vehicle.VehicleType.CAR).isNotNull();
    }

    @Test
    void vehicleType_hasBikeValue() {
        assertThat(Vehicle.VehicleType.BIKE).isNotNull();
    }

    @Test
    void vehicleType_canBeSetToCar() {
        vehicle.setType(Vehicle.VehicleType.CAR);

        assertThat(vehicle.getType()).isEqualTo(Vehicle.VehicleType.CAR);
    }

    @Test
    void vehicleType_canBeSetToBike() {
        vehicle.setType(Vehicle.VehicleType.BIKE);

        assertThat(vehicle.getType()).isEqualTo(Vehicle.VehicleType.BIKE);
    }

    // ── complex scenarios ───────────────────────────────────

    @Test
    void vehicle_withAllFieldsSet() {
        vehicle.setVehicleId(10L);
        vehicle.setName("Royal Enfield Classic");
        vehicle.setType(Vehicle.VehicleType.BIKE);
        vehicle.setDescription("Retro-style touring motorcycle");
        vehicle.setAvailabilityStatus(true);
        vehicle.setAddedBy(admin);

        assertThat(vehicle.getVehicleId()).isEqualTo(10L);
        assertThat(vehicle.getName()).isEqualTo("Royal Enfield Classic");
        assertThat(vehicle.getType()).isEqualTo(Vehicle.VehicleType.BIKE);
        assertThat(vehicle.getDescription()).isEqualTo("Retro-style touring motorcycle");
        assertThat(vehicle.isAvailabilityStatus()).isTrue();
        assertThat(vehicle.getAddedBy()).isEqualTo(admin);
        assertThat(vehicle.getCreatedAt()).isNotNull();
    }

    @Test
    void vehicle_availabilityStatusCanToggle() {
        vehicle.setAvailabilityStatus(true);
        assertThat(vehicle.isAvailabilityStatus()).isTrue();

        vehicle.setAvailabilityStatus(false);
        assertThat(vehicle.isAvailabilityStatus()).isFalse();

        vehicle.setAvailabilityStatus(true);
        assertThat(vehicle.isAvailabilityStatus()).isTrue();
    }

    @Test
    void vehicle_nameCanBeUpdated() {
        vehicle.setName("Original Name");
        assertThat(vehicle.getName()).isEqualTo("Original Name");

        vehicle.setName("Updated Name");
        assertThat(vehicle.getName()).isEqualTo("Updated Name");
    }

    @Test
    void vehicle_descriptionCanBeUpdated() {
        vehicle.setDescription("Original description");
        assertThat(vehicle.getDescription()).isEqualTo("Original description");

        vehicle.setDescription("Updated description");
        assertThat(vehicle.getDescription()).isEqualTo("Updated description");
    }

    @Test
    void vehicle_typeCanBeChanged() {
        vehicle.setType(Vehicle.VehicleType.CAR);
        assertThat(vehicle.getType()).isEqualTo(Vehicle.VehicleType.CAR);

        vehicle.setType(Vehicle.VehicleType.BIKE);
        assertThat(vehicle.getType()).isEqualTo(Vehicle.VehicleType.BIKE);
    }

    @Test
    void vehicle_multipleVehiclesCanHaveDifferentTypes() {
        Vehicle car = new Vehicle();
        car.setType(Vehicle.VehicleType.CAR);

        Vehicle bike = new Vehicle();
        bike.setType(Vehicle.VehicleType.BIKE);

        assertThat(car.getType()).isEqualTo(Vehicle.VehicleType.CAR);
        assertThat(bike.getType()).isEqualTo(Vehicle.VehicleType.BIKE);
        assertThat(car.getType()).isNotEqualTo(bike.getType());
    }
}