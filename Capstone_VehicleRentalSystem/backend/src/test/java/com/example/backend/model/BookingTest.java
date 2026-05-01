package com.example.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

class BookingTest {

    private Booking booking;
    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("john_doe");
        user.setEmail("john@example.com");

        vehicle = new Vehicle();
        vehicle.setVehicleId(10L);
        vehicle.setName("Honda City");
        vehicle.setType(Vehicle.VehicleType.CAR);

        booking = new Booking();
    }

    /** getters and setters */

    @Test
    void bookingId_canBeSet_andRetrieved() {
        booking.setBookingId(1L);

        assertThat(booking.getBookingId()).isEqualTo(1L);
    }

    @Test
    void user_canBeSet_andRetrieved() {
        booking.setUser(user);

        assertThat(booking.getUser()).isEqualTo(user);
        assertThat(booking.getUser().getUsername()).isEqualTo("john_doe");
    }

    @Test
    void vehicle_canBeSet_andRetrieved() {
        booking.setVehicle(vehicle);

        assertThat(booking.getVehicle()).isEqualTo(vehicle);
        assertThat(booking.getVehicle().getName()).isEqualTo("Honda City");
    }

    @Test
    void startDate_canBeSet_andRetrieved() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        booking.setStartDate(start);

        assertThat(booking.getStartDate()).isEqualTo(start);
    }

    @Test
    void endDate_canBeSet_andRetrieved() {
        LocalDateTime end = LocalDateTime.now().plusDays(3);
        booking.setEndDate(end);

        assertThat(booking.getEndDate()).isEqualTo(end);
    }

    @Test
    void status_canBeSet_andRetrieved() {
        booking.setStatus(Booking.Status.CONFIRMED);

        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CONFIRMED);
    }

    @Test
    void createdAt_isNotNullByDefault() {
        assertThat(booking.getCreatedAt()).isNotNull();
    }

    @Test
void createdAt_isSetToCurrentTimeByDefault() {
    LocalDateTime before = LocalDateTime.now();
    Booking b = new Booking();
    LocalDateTime after = LocalDateTime.now();

    assertThat(b.getCreatedAt()).isAfterOrEqualTo(before);
    assertThat(b.getCreatedAt()).isBeforeOrEqualTo(after.plusSeconds(1));
}
    /** status enum */

    @Test
    void status_hasPendingValue() {
        assertThat(Booking.Status.PENDING).isNotNull();
    }

    @Test
    void status_hasConfirmedValue() {
        assertThat(Booking.Status.CONFIRMED).isNotNull();
    }

    @Test
    void status_hasCompletedValue() {
        assertThat(Booking.Status.COMPLETED).isNotNull();
    }

    @Test
    void status_hasCancelledValue() {
        assertThat(Booking.Status.CANCELLED).isNotNull();
    }

    @Test
    void status_defaultsToConfirmed() {
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(LocalDateTime.now().plusDays(1));
        booking.setEndDate(LocalDateTime.now().plusDays(3));

        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CONFIRMED);
    }

    /** complex scenarios */

    @Test
    void booking_withAllFieldsSet() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        booking.setBookingId(100L);
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(start);
        booking.setEndDate(end);
        booking.setStatus(Booking.Status.PENDING);

        assertThat(booking.getBookingId()).isEqualTo(100L);
        assertThat(booking.getUser()).isEqualTo(user);
        assertThat(booking.getVehicle()).isEqualTo(vehicle);
        assertThat(booking.getStartDate()).isEqualTo(start);
        assertThat(booking.getEndDate()).isEqualTo(end);
        assertThat(booking.getStatus()).isEqualTo(Booking.Status.PENDING);
        assertThat(booking.getCreatedAt()).isNotNull();
    }

    @Test
    void booking_canChangeStatus() {
        booking.setStatus(Booking.Status.CONFIRMED);
        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CONFIRMED);

        booking.setStatus(Booking.Status.CANCELLED);
        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);

        booking.setStatus(Booking.Status.COMPLETED);
        assertThat(booking.getStatus()).isEqualTo(Booking.Status.COMPLETED);
    }

    @Test
    void booking_datesCanSpanMultipleDays() {
        LocalDateTime start = LocalDateTime.of(2025, 6, 1, 10, 0);
        LocalDateTime end = LocalDateTime.of(2025, 6, 10, 15, 30);

        booking.setStartDate(start);
        booking.setEndDate(end);

        assertThat(booking.getStartDate()).isEqualTo(start);
        assertThat(booking.getEndDate()).isEqualTo(end);
        assertThat(booking.getEndDate()).isAfter(booking.getStartDate());
    }
}