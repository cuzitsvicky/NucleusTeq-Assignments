package com.example.backend.service;

import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Booking;
import com.example.backend.model.User;
import com.example.backend.model.Vehicle;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private VehicleService vehicleService;

    private User admin;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setUserId(1L);
        admin.setUsername("admin_user");
        admin.setEmail("admin@example.com");
        admin.setRole(User.Role.ADMIN);

        vehicle = new Vehicle();
        vehicle.setVehicleId(1L);
        vehicle.setName("Honda City");
        vehicle.setType(Vehicle.VehicleType.CAR);
        vehicle.setDescription("Comfortable sedan");
        vehicle.setAvailabilityStatus(true);
        vehicle.setAddedBy(admin);
    }

    // ── getAllVehicles ──────────────────────────────────────

    @Test
    void getAllVehicles_success() {
        when(vehicleRepository.findAll()).thenReturn(List.of(vehicle));

        List<VehicleResponseDto> result = vehicleService.getAllVehicles();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Honda City");
    }

    @Test
    void getAllVehicles_returnsEmpty() {
        when(vehicleRepository.findAll()).thenReturn(List.of());

        List<VehicleResponseDto> result = vehicleService.getAllVehicles();

        assertThat(result).isEmpty();
    }

    // ── getAvailableVehicles ────────────────────────────────

    @Test
    void getAvailableVehicles_returnsOnlyAvailable() {
        Vehicle unavailable = new Vehicle();
        unavailable.setVehicleId(2L);
        unavailable.setName("Bike");
        unavailable.setType(Vehicle.VehicleType.BIKE);
        unavailable.setAvailabilityStatus(false);
        unavailable.setAddedBy(admin);

        when(vehicleRepository.findByAvailabilityStatusTrue()).thenReturn(List.of(vehicle));

        List<VehicleResponseDto> result = vehicleService.getAvailableVehicles();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isAvailabilityStatus()).isTrue();
    }

    // ── getAvailableVehiclesForRange ────────────────────────

    @Test
    void getAvailableVehiclesForRange_success() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        when(vehicleRepository.findByAvailabilityStatusTrue()).thenReturn(List.of(vehicle));
        when(bookingRepository
                .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                        any(), anyList(), any(), any()))
                .thenReturn(List.of());

        List<VehicleResponseDto> result = vehicleService.getAvailableVehiclesForRange(start, end);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Honda City");
    }

    @Test
    void getAvailableVehiclesForRange_returnsEmpty_whenConflictExists() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        Booking conflict = new Booking();
        conflict.setStatus(Booking.Status.CONFIRMED);

        when(vehicleRepository.findByAvailabilityStatusTrue()).thenReturn(List.of(vehicle));
        when(bookingRepository
                .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                        any(), anyList(), any(), any()))
                .thenReturn(List.of(conflict));

        List<VehicleResponseDto> result = vehicleService.getAvailableVehiclesForRange(start, end);

        assertThat(result).isEmpty();
    }

    @Test
    void getAvailableVehiclesForRange_throwsBadRequestException_whenEndBeforeStart() {
        LocalDateTime start = LocalDateTime.now().plusDays(3);
        LocalDateTime end = LocalDateTime.now().plusDays(1);

        assertThatThrownBy(() -> vehicleService.getAvailableVehiclesForRange(start, end))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date must be after start date");
    }

    @Test
    void getAvailableVehiclesForRange_throwsBadRequestException_whenEndEqualsStart() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = start;

        assertThatThrownBy(() -> vehicleService.getAvailableVehiclesForRange(start, end))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date must be after start date");
    }

    // ── getVehicleById ──────────────────────────────────────

    @Test
    void getVehicleById_success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        VehicleResponseDto result = vehicleService.getVehicleById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Honda City");
        assertThat(result.getType()).isEqualTo("Car");
    }

    @Test
    void getVehicleById_throwsResourceNotFoundException() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.getVehicleById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    // ── addVehicle ──────────────────────────────────────────

    @Test
    void addVehicle_success_typeCarUpperCase() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("New Car");
        dto.setType("Car");
        dto.setDescription("Test car");
        dto.setAvailabilityStatus(true);

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponseDto result = vehicleService.addVehicle("admin@example.com", dto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Honda City");
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void addVehicle_success_typeBikeUpperCase() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("New Bike");
        dto.setType("Bike");
        dto.setDescription("Test bike");
        dto.setAvailabilityStatus(true);

        Vehicle bikeVehicle = new Vehicle();
        bikeVehicle.setVehicleId(2L);
        bikeVehicle.setName("New Bike");
        bikeVehicle.setType(Vehicle.VehicleType.BIKE);
        bikeVehicle.setAddedBy(admin);

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(bikeVehicle);

        VehicleResponseDto result = vehicleService.addVehicle("admin@example.com", dto);

        assertThat(result.getType()).isEqualTo("Bike");
    }

    @Test
    void addVehicle_success_defaultsToAvailable_whenStatusNull() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("New Car");
        dto.setType("Car");
        dto.setDescription("Test");
        dto.setAvailabilityStatus(null);

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponseDto result = vehicleService.addVehicle("admin@example.com", dto);

        assertThat(result).isNotNull();
    }

    @Test
    void addVehicle_throwsBadRequestException_whenInvalidType() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("Invalid Vehicle");
        dto.setType("Helicopter");
        dto.setDescription("Invalid type");

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);

        assertThatThrownBy(() -> vehicleService.addVehicle("admin@example.com", dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Car or Bike");

        verify(vehicleRepository, never()).save(any());
    }

    // ── updateVehicle ───────────────────────────────────────

    @Test
    void updateVehicle_success() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("Updated Name");
        dto.setType("Car");
        dto.setDescription("Updated description");
        dto.setAvailabilityStatus(false);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponseDto result = vehicleService.updateVehicle("admin@example.com", 1L, dto);

        assertThat(result).isNotNull();
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void updateVehicle_throwsResourceNotFoundException() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("Updated Name");
        dto.setType("Car");

        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.updateVehicle("admin@example.com", 999L, dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    @Test
    void updateVehicle_throwsBadRequestException_whenInvalidType() {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName("Updated");
        dto.setType("Truck");

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> vehicleService.updateVehicle("admin@example.com", 1L, dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Car or Bike");
    }

    // ── deleteVehicle ───────────────────────────────────────

    @Test
    void deleteVehicle_success_whenNoActiveBookings() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicle(vehicle)).thenReturn(List.of());

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteVehicle_success_onlyIgnoresCompletedAndCancelledBookings() {
        Booking completed = new Booking();
        completed.setStatus(Booking.Status.COMPLETED);
        completed.setEndDate(LocalDateTime.now().minusDays(1));

        Booking cancelled = new Booking();
        cancelled.setStatus(Booking.Status.CANCELLED);
        cancelled.setEndDate(LocalDateTime.now().minusDays(1));

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicle(vehicle)).thenReturn(List.of(completed, cancelled));

        vehicleService.deleteVehicle(1L);

        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteVehicle_throwsBadRequestException_whenActiveBookingExists() {
        Booking activeBooking = new Booking();
        activeBooking.setStatus(Booking.Status.CONFIRMED);
        activeBooking.setEndDate(LocalDateTime.now().plusDays(1));

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicle(vehicle)).thenReturn(List.of(activeBooking));

        assertThatThrownBy(() -> vehicleService.deleteVehicle(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete vehicle with active or upcoming bookings");

        verify(vehicleRepository, never()).delete(any());
    }

    @Test
    void deleteVehicle_throwsBadRequestException_whenPendingBookingExists() {
        Booking pendingBooking = new Booking();
        pendingBooking.setStatus(Booking.Status.PENDING);
        pendingBooking.setEndDate(LocalDateTime.now().plusDays(5));

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicle(vehicle)).thenReturn(List.of(pendingBooking));

        assertThatThrownBy(() -> vehicleService.deleteVehicle(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete vehicle with active or upcoming bookings");
    }

    @Test
    void deleteVehicle_throwsResourceNotFoundException() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.deleteVehicle(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }
}