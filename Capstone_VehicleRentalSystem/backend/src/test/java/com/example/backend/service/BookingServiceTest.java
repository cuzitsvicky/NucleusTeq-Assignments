package com.example.backend.service;

import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
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
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setUsername("john_doe");
        user.setEmail("john@example.com");
        user.setRole(User.Role.USER);

        vehicle = new Vehicle();
        vehicle.setVehicleId(10L);
        vehicle.setName("Honda City");
        vehicle.setType(Vehicle.VehicleType.CAR);
        vehicle.setAvailabilityStatus(true);
        vehicle.setAddedBy(user);
    }

    // ── bookVehicle ─────────────────────────────────────────

    @Test
    void bookVehicle_success() {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(10L);
        dto.setStartDate(LocalDateTime.now().plusDays(1).toString());
        dto.setEndDate(LocalDateTime.now().plusDays(3).toString());

        Booking savedBooking = new Booking();
        savedBooking.setBookingId(100L);
        savedBooking.setUser(user);
        savedBooking.setVehicle(vehicle);
        savedBooking.setStartDate(LocalDateTime.now().plusDays(1));
        savedBooking.setEndDate(LocalDateTime.now().plusDays(3));
        savedBooking.setStatus(Booking.Status.CONFIRMED);

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository
                .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                        any(), anyList(), any(), any()))
                .thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponseDto result = bookingService.bookVehicle("john@example.com", dto);

        assertThat(result).isNotNull();
        assertThat(result.getBookingId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void bookVehicle_throwsResourceNotFoundException_whenVehicleNotFound() {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(999L);
        dto.setStartDate(LocalDateTime.now().plusDays(1).toString());
        dto.setEndDate(LocalDateTime.now().plusDays(3).toString());

        when(userService.findEntityByEmail(anyString())).thenReturn(user);
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    @Test
    void bookVehicle_throwsBadRequestException_whenStartDateInPast() {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(10L);
        dto.setStartDate(LocalDateTime.now().minusDays(1).toString());
        dto.setEndDate(LocalDateTime.now().plusDays(1).toString());

        when(userService.findEntityByEmail(anyString())).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Start date must be present or future");
    }

    @Test
    void bookVehicle_throwsBadRequestException_whenEndDateBeforeStartDate() {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(10L);
        dto.setStartDate(LocalDateTime.now().plusDays(3).toString());
        dto.setEndDate(LocalDateTime.now().plusDays(1).toString());

        when(userService.findEntityByEmail(anyString())).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End date must be after start date");
    }

    @Test
    void bookVehicle_throwsBadRequestException_whenConflictingBookingExists() {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(10L);
        dto.setStartDate(LocalDateTime.now().plusDays(1).toString());
        dto.setEndDate(LocalDateTime.now().plusDays(3).toString());

        Booking conflicting = new Booking();
        conflicting.setStatus(Booking.Status.CONFIRMED);

        when(userService.findEntityByEmail(anyString())).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository
                .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                        any(), anyList(), any(), any()))
                .thenReturn(List.of(conflicting));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available for the selected time range");
    }

    @Test
    void bookVehicle_throwsBadRequestException_whenDateFormatInvalid() {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(10L);
        dto.setStartDate("not-a-date");
        dto.setEndDate("also-not-a-date");

        when(userService.findEntityByEmail(anyString())).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Date format");
    }

    // ── getMyBookings ────────────────────────────────────────

    @Test
    void getMyBookings_returnsBookingsForUser() {
        Booking booking = new Booking();
        booking.setBookingId(1L);
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(LocalDateTime.now().plusDays(1));
        booking.setEndDate(LocalDateTime.now().plusDays(3));
        booking.setStatus(Booking.Status.CONFIRMED);

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findByUser(user)).thenReturn(List.of(booking));

        List<BookingResponseDto> result = bookingService.getMyBookings("john@example.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBookingId()).isEqualTo(1L);
    }

    @Test
    void getMyBookings_autoCompletesExpiredBookings() {
        Booking expiredBooking = new Booking();
        expiredBooking.setBookingId(2L);
        expiredBooking.setUser(user);
        expiredBooking.setVehicle(vehicle);
        expiredBooking.setStartDate(LocalDateTime.now().minusDays(5));
        expiredBooking.setEndDate(LocalDateTime.now().minusDays(1));
        expiredBooking.setStatus(Booking.Status.CONFIRMED);

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findByUser(user)).thenReturn(List.of(expiredBooking));
        when(bookingRepository.saveAll(anyList())).thenReturn(List.of(expiredBooking));

        List<BookingResponseDto> result = bookingService.getMyBookings("john@example.com");

        assertThat(result).hasSize(1);
        verify(bookingRepository).saveAll(anyList());
    }

    @Test
    void getMyBookings_returnsEmpty_whenNoBookings() {
        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findByUser(user)).thenReturn(List.of());

        List<BookingResponseDto> result = bookingService.getMyBookings("john@example.com");

        assertThat(result).isEmpty();
    }

    // ── getAllBookings ────────────────────────────────────────

    @Test
    void getAllBookings_returnsAllBookings() {
        Booking b1 = makeBooking(1L, user, vehicle, Booking.Status.CONFIRMED,
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(3));
        Booking b2 = makeBooking(2L, user, vehicle, Booking.Status.CANCELLED,
                LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(7));

        when(bookingRepository.findAll()).thenReturn(List.of(b1, b2));

        List<BookingResponseDto> result = bookingService.getAllBookings();

        assertThat(result).hasSize(2);
    }

    // ── cancelBooking ────────────────────────────────────────

    @Test
    void cancelBooking_success_byOwner() {
        Booking booking = makeBooking(50L, user, vehicle, Booking.Status.CONFIRMED,
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(4));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        bookingService.cancelBooking("john@example.com", 50L);

        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_success_byAdmin() {
        User admin = new User();
        admin.setUserId(99L);
        admin.setEmail("admin@example.com");
        admin.setRole(User.Role.ADMIN);

        Booking booking = makeBooking(50L, user, vehicle, Booking.Status.CONFIRMED,
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(4));

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        bookingService.cancelBooking("admin@example.com", 50L);

        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);
    }

    @Test
    void cancelBooking_throwsForbiddenException_whenNotOwnerOrAdmin() {
        User otherUser = new User();
        otherUser.setUserId(77L);
        otherUser.setEmail("other@example.com");
        otherUser.setRole(User.Role.USER);

        Booking booking = makeBooking(50L, user, vehicle, Booking.Status.CONFIRMED,
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(4));

        when(userService.findEntityByEmail("other@example.com")).thenReturn(otherUser);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("other@example.com", 50L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("cancel only your own booking");
    }

    @Test
    void cancelBooking_throwsBadRequestException_whenAlreadyCancelled() {
        Booking booking = makeBooking(50L, user, vehicle, Booking.Status.CANCELLED,
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(4));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("john@example.com", 50L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void cancelBooking_throwsBadRequestException_whenBookingAlreadyStarted() {
        Booking booking = makeBooking(50L, user, vehicle, Booking.Status.CONFIRMED,
                LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(2));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("john@example.com", 50L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot cancel booking after start date");
    }

    @Test
    void cancelBooking_throwsResourceNotFoundException_whenBookingNotFound() {
        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.cancelBooking("john@example.com", 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Booking not found");
    }

    // ── getVehicleBookings ───────────────────────────────────

    @Test
    void getVehicleBookings_returnsBookingsForVehicle() {
        Booking booking = makeBooking(1L, user, vehicle, Booking.Status.CONFIRMED,
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(3));

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicle(vehicle)).thenReturn(List.of(booking));

        List<BookingResponseDto> result = bookingService.getVehicleBookings(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    void getVehicleBookings_throwsResourceNotFoundException_whenVehicleNotFound() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getVehicleBookings(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    // ── helpers ──────────────────────────────────────────────

    private Booking makeBooking(Long id, User u, Vehicle v, Booking.Status status,
                                 LocalDateTime start, LocalDateTime end) {
        Booking b = new Booking();
        b.setBookingId(id);
        b.setUser(u);
        b.setVehicle(v);
        b.setStatus(status);
        b.setStartDate(start);
        b.setEndDate(end);
        return b;
    }
}