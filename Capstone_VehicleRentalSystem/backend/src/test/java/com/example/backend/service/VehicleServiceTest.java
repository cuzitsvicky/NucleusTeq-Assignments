package com.example.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Booking;
import com.example.backend.model.User;
import com.example.backend.model.Vehicle;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VehicleRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserService userService;

    private VehicleService vehicleService;
    private User admin;
    private Vehicle car;

    @BeforeEach
    void setUp() {
        vehicleService = new VehicleService(vehicleRepository, bookingRepository, userService);
        admin = user(1L, "admin", "admin@example.com", User.Role.ADMIN);
        car = vehicle(1L, "Honda City", Vehicle.VehicleType.CAR, true);
    }

    @Test
    void getAllVehicles_returnsVehicles() {
        when(vehicleRepository.findAll()).thenReturn(List.of(car));

        List<VehicleResponseDto> result = vehicleService.getAllVehicles();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Honda City");
    }

    @Test
    void getAvailableVehicles_returnsOnlyRepositoryAvailableVehicles() {
        when(vehicleRepository.findByAvailabilityStatusTrue()).thenReturn(List.of(car));

        List<VehicleResponseDto> result = vehicleService.getAvailableVehicles();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isAvailabilityStatus()).isTrue();
    }

    @Test
    void getAvailableVehiclesForRange_returnsVehiclesWithoutConflicts() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        when(vehicleRepository.findByAvailabilityStatusTrue()).thenReturn(List.of(car));
        when(bookingRepository.findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                any(), anyList(), any(), any())).thenReturn(List.of());

        List<VehicleResponseDto> result = vehicleService.getAvailableVehiclesForRange(start, end);

        assertThat(result).hasSize(1);
    }

    @Test
    void getAvailableVehiclesForRange_filtersVehiclesWithConflicts() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);

        when(vehicleRepository.findByAvailabilityStatusTrue()).thenReturn(List.of(car));
        when(bookingRepository.findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                any(), anyList(), any(), any())).thenReturn(List.of(booking(1L, Booking.Status.CONFIRMED, end)));

        List<VehicleResponseDto> result = vehicleService.getAvailableVehiclesForRange(start, end);

        assertThat(result).isEmpty();
    }

    @Test
    void getAvailableVehiclesForRange_rejectsInvalidRange() {
        LocalDateTime start = LocalDateTime.now().plusDays(3);
        LocalDateTime end = LocalDateTime.now().plusDays(1);

        assertThatThrownBy(() -> vehicleService.getAvailableVehiclesForRange(start, end))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date must be after start date");
    }

    @Test
    void getVehicleById_returnsVehicle() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));

        VehicleResponseDto result = vehicleService.getVehicleById(1L);

        assertThat(result.getName()).isEqualTo("Honda City");
        assertThat(result.getType()).isEqualTo("Car");
    }

    @Test
    void getVehicleById_throwsWhenMissing() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.getVehicleById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void addVehicle_savesNewVehicle() {
        VehicleRequestDto request = vehicleRequest("New Car", "Car", true);

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(car);

        VehicleResponseDto result = vehicleService.addVehicle("admin@example.com", request);

        assertThat(result.getName()).isEqualTo("Honda City");
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void addVehicle_acceptsBikeType() {
        Vehicle bike = vehicle(2L, "Yamaha FZ", Vehicle.VehicleType.BIKE, true);
        VehicleRequestDto request = vehicleRequest("Yamaha FZ", "Bike", true);

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(bike);

        VehicleResponseDto result = vehicleService.addVehicle("admin@example.com", request);

        assertThat(result.getType()).isEqualTo("Bike");
    }

    @Test
    void addVehicle_defaultsMissingAvailabilityToTrue() {
        VehicleRequestDto request = vehicleRequest("New Car", "Car", null);

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(car);

        VehicleResponseDto result = vehicleService.addVehicle("admin@example.com", request);

        assertThat(result.isAvailabilityStatus()).isTrue();
    }

    @Test
    void addVehicle_rejectsInvalidType() {
        VehicleRequestDto request = vehicleRequest("Flying Thing", "Plane", true);
        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);

        assertThatThrownBy(() -> vehicleService.addVehicle("admin@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Car or Bike");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    void updateVehicle_updatesExistingVehicle() {
        VehicleRequestDto request = vehicleRequest("Updated Honda", "Car", false);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));
        when(vehicleRepository.save(car)).thenReturn(car);

        VehicleResponseDto result = vehicleService.updateVehicle("admin@example.com", 1L, request);

        assertThat(result).isNotNull();
        assertThat(car.getName()).isEqualTo("Updated Honda");
        assertThat(car.isAvailabilityStatus()).isFalse();
    }

    @Test
    void updateVehicle_throwsWhenMissing() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.updateVehicle("admin@example.com", 99L, vehicleRequest("X", "Car", true)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void updateVehicle_rejectsInvalidType() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));

        assertThatThrownBy(() -> vehicleService.updateVehicle("admin@example.com", 1L, vehicleRequest("X", "Truck", true)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Car or Bike");
    }

    @Test
    void deleteVehicle_deletesWhenNoActiveBookings() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));
        when(bookingRepository.findByVehicle(car)).thenReturn(List.of());

        vehicleService.deleteVehicle(1L);

        verify(bookingRepository).saveAll(List.of());
        verify(vehicleRepository).delete(car);
    }

    @Test
    void deleteVehicle_keepsVehicleWhenActiveBookingExists() {
        Booking activeBooking = booking(1L, Booking.Status.CONFIRMED, LocalDateTime.now().plusDays(1));

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));
        when(bookingRepository.findByVehicle(car)).thenReturn(List.of(activeBooking));

        assertThatThrownBy(() -> vehicleService.deleteVehicle(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("active or upcoming bookings");

        verify(vehicleRepository, never()).delete(any());
    }

    @Test
    void deleteVehicle_nullsHistoricalBookingsBeforeDelete() {
        Booking oldBooking = booking(1L, Booking.Status.COMPLETED, LocalDateTime.now().minusDays(1));

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(car));
        when(bookingRepository.findByVehicle(car)).thenReturn(List.of(oldBooking));

        vehicleService.deleteVehicle(1L);

        assertThat(oldBooking.getVehicle()).isNull();
        verify(bookingRepository).saveAll(List.of(oldBooking));
        verify(vehicleRepository).delete(car);
    }

    @Test
    void deleteVehicle_throwsWhenMissing() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.deleteVehicle(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    private VehicleRequestDto vehicleRequest(String name, String type, Boolean available) {
        VehicleRequestDto request = new VehicleRequestDto();
        request.setName(name);
        request.setType(type);
        request.setDescription("Test vehicle");
        request.setAvailabilityStatus(available);
        return request;
    }

    private Booking booking(Long id, Booking.Status status, LocalDateTime endDate) {
        Booking booking = new Booking();
        booking.setBookingId(id);
        booking.setVehicle(car);
        booking.setStatus(status);
        booking.setEndDate(endDate);
        return booking;
    }

    private Vehicle vehicle(Long id, String name, Vehicle.VehicleType type, boolean available) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(id);
        vehicle.setName(name);
        vehicle.setType(type);
        vehicle.setDescription("Test vehicle");
        vehicle.setAvailabilityStatus(available);
        vehicle.setAddedBy(admin);
        return vehicle;
    }

    private static User user(Long id, String username, String email, User.Role role) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }
}
