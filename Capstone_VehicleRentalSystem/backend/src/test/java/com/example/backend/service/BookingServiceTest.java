package com.example.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserService userService;

    private BookingService bookingService;
    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(bookingRepository, vehicleRepository, userService);
        user = user(1L, "john", "john@example.com", User.Role.USER);
        vehicle = vehicle(10L, "Honda City", Vehicle.VehicleType.CAR);
    }

    @Test
    void bookVehicle_createsBookingWhenVehicleIsFree() {
        BookingRequestDto request = bookingRequest(10L, daysFromNow(1), daysFromNow(3));
        Booking savedBooking = booking(100L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                any(), anyList(), any(), any())).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponseDto result = bookingService.bookVehicle("john@example.com", request);

        assertThat(result.getBookingId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void bookVehicle_throwsWhenVehicleIsMissing() {
        BookingRequestDto request = bookingRequest(99L, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void bookVehicle_rejectsInvalidDateFormat() {
        BookingRequestDto request = bookingRequest(10L, "bad-start", "bad-end");

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Date format");
    }

    @Test
    void bookVehicle_rejectsPastStartDate() {
        BookingRequestDto request = bookingRequest(10L, daysFromNow(-1), daysFromNow(1));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("present or future");
    }

    @Test
    void bookVehicle_rejectsEndBeforeStart() {
        BookingRequestDto request = bookingRequest(10L, daysFromNow(3), daysFromNow(1));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("after start date");
    }

    @Test
    void bookVehicle_rejectsConflictingBooking() {
        BookingRequestDto request = bookingRequest(10L, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                any(), anyList(), any(), any()))
                .thenReturn(List.of(booking(1L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3))));

        assertThatThrownBy(() -> bookingService.bookVehicle("john@example.com", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void getMyBookings_returnsUserBookings() {
        Booking booking = booking(1L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findByUser(user)).thenReturn(List.of(booking));

        List<BookingResponseDto> result = bookingService.getMyBookings("john@example.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getVehicleName()).isEqualTo("Honda City");
    }

    @Test
    void getMyBookings_completesExpiredBookings() {
        Booking expired = booking(2L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(-5), daysFromNow(-1));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findByUser(user)).thenReturn(List.of(expired));
        when(bookingRepository.saveAll(List.of(expired))).thenReturn(List.of(expired));

        List<BookingResponseDto> result = bookingService.getMyBookings("john@example.com");

        assertThat(result.get(0).getStatus()).isEqualTo("COMPLETED");
        verify(bookingRepository).saveAll(List.of(expired));
    }

    @Test
    void getAllBookings_returnsAllBookings() {
        when(bookingRepository.findAll()).thenReturn(List.of(
                booking(1L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3)),
                booking(2L, user, vehicle, Booking.Status.CANCELLED, daysFromNow(4), daysFromNow(5))));

        List<BookingResponseDto> result = bookingService.getAllBookings();

        assertThat(result).hasSize(2);
    }

    @Test
    void getAllBookings_handlesDeletedVehicle() {
        Booking deletedVehicleBooking = booking(1L, user, null, Booking.Status.CANCELLED, daysFromNow(1), daysFromNow(3));
        when(bookingRepository.findAll()).thenReturn(List.of(deletedVehicleBooking));

        List<BookingResponseDto> result = bookingService.getAllBookings();

        assertThat(result.get(0).getVehicleId()).isNull();
        assertThat(result.get(0).getVehicleName()).isEqualTo("[Deleted Vehicle]");
        assertThat(result.get(0).getType()).isEqualTo("Unknown");
    }

    @Test
    void cancelBooking_allowsOwner() {
        Booking booking = booking(50L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        bookingService.cancelBooking("john@example.com", 50L);

        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancelBooking_allowsAdmin() {
        User admin = user(2L, "admin", "admin@example.com", User.Role.ADMIN);
        Booking booking = booking(50L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("admin@example.com")).thenReturn(admin);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        bookingService.cancelBooking("admin@example.com", 50L);

        assertThat(booking.getStatus()).isEqualTo(Booking.Status.CANCELLED);
    }

    @Test
    void cancelBooking_rejectsDifferentUser() {
        User otherUser = user(3L, "other", "other@example.com", User.Role.USER);
        Booking booking = booking(50L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("other@example.com")).thenReturn(otherUser);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("other@example.com", 50L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("own booking");
    }

    @Test
    void cancelBooking_rejectsMissingBooking() {
        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.cancelBooking("john@example.com", 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void cancelBooking_rejectsAlreadyCancelledBooking() {
        Booking booking = booking(50L, user, vehicle, Booking.Status.CANCELLED, daysFromNow(1), daysFromNow(3));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("john@example.com", 50L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void cancelBooking_rejectsStartedBooking() {
        Booking booking = booking(50L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(-1), daysFromNow(2));

        when(userService.findEntityByEmail("john@example.com")).thenReturn(user);
        when(bookingRepository.findById(50L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("john@example.com", 50L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("after start date");
    }

    @Test
    void getVehicleBookings_returnsBookingsForVehicle() {
        Booking booking = booking(1L, user, vehicle, Booking.Status.CONFIRMED, daysFromNow(1), daysFromNow(3));

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.findByVehicle(vehicle)).thenReturn(List.of(booking));

        List<BookingResponseDto> result = bookingService.getVehicleBookings(10L);

        assertThat(result).hasSize(1);
    }

    @Test
    void getVehicleBookings_throwsWhenVehicleIsMissing() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getVehicleBookings(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    private static String daysFromNow(int days) {
        return LocalDateTime.now().plusDays(days).toString();
    }

    private static BookingRequestDto bookingRequest(Long vehicleId, String start, String end) {
        BookingRequestDto request = new BookingRequestDto();
        request.setVehicleId(vehicleId);
        request.setStartDate(start);
        request.setEndDate(end);
        return request;
    }

    private static Booking booking(Long id, User user, Vehicle vehicle, Booking.Status status, String start, String end) {
        Booking booking = new Booking();
        booking.setBookingId(id);
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStatus(status);
        booking.setStartDate(LocalDateTime.parse(start));
        booking.setEndDate(LocalDateTime.parse(end));
        return booking;
    }

    private static User user(Long id, String username, String email, User.Role role) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }

    private static Vehicle vehicle(Long id, String name, Vehicle.VehicleType type) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(id);
        vehicle.setName(name);
        vehicle.setType(type);
        vehicle.setAvailabilityStatus(true);
        return vehicle;
    }
}
