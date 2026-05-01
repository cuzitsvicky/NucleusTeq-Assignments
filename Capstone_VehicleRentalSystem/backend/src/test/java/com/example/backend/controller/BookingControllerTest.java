package com.example.backend.controller;

import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.BookingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ============================================================
 *  BookingControllerTest — Pure Unit Tests (no Spring context)
 * ============================================================
 *
 *  Tests the BookingController in isolation by mocking BookingService.
 *  Covers: booking creation, my-bookings, all-bookings (admin),
 *  vehicle-specific bookings (admin), and booking cancellation.
 * ============================================================
 */
class BookingControllerTest {

    // ── Mocks ─────────────────────────────────────────────────
    @Mock
    private BookingService bookingService;

    @Mock
    private Authentication authentication;

    // ── The class we are actually testing ────────────────────
    @InjectMocks
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(authentication.getName()).thenReturn("user@example.com");
    }

    // =========================================================
    //  BOOK VEHICLE TESTS
    // =========================================================

    @Test
    @DisplayName("Book Vehicle — success: returns 200 with BookingResponseDto")
    void bookVehicle_validRequest_returnsBookingResponse() {
        // ── ARRANGE ───────────────────────────────────────────
        BookingRequestDto dto = buildBookingRequestDto(3L, "2025-06-01T10:00:00", "2025-06-05T10:00:00");

        BookingResponseDto mockResponse = buildBookingResponseDto(1L, 3L, "Honda City", "CONFIRMED");

        when(bookingService.bookVehicle("user@example.com", dto)).thenReturn(mockResponse);

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<BookingResponseDto> response =
                bookingController.bookVehicle(dto, authentication);

        // ── ASSERT ────────────────────────────────────────────
        assertNotNull(response, "Response should not be null");
        assertEquals(200, response.getStatusCode().value(), "HTTP status should be 200 OK");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertEquals(1L, response.getBody().getBookingId());
        assertEquals("Honda City", response.getBody().getVehicleName());
        assertEquals("CONFIRMED", response.getBody().getStatus());

        verify(bookingService, times(1)).bookVehicle("user@example.com", dto);
    }

    @Test
    @DisplayName("Book Vehicle — past start date: service throws BadRequestException")
    void bookVehicle_pastStartDate_throwsBadRequestException() {
        // ── ARRANGE ───────────────────────────────────────────
        BookingRequestDto dto = buildBookingRequestDto(3L, "2020-01-01T10:00:00", "2020-01-05T10:00:00");

        when(bookingService.bookVehicle(anyString(), any(BookingRequestDto.class)))
                .thenThrow(new BadRequestException("Start date must be present or future"));

        // ── ACT + ASSERT ──────────────────────────────────────
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingController.bookVehicle(dto, authentication));

        assertTrue(ex.getMessage().contains("Start date"));
    }

    @Test
    @DisplayName("Book Vehicle — end before start: service throws BadRequestException")
    void bookVehicle_endDateBeforeStartDate_throwsBadRequestException() {
        // ── ARRANGE ───────────────────────────────────────────
        BookingRequestDto dto = buildBookingRequestDto(3L, "2025-06-05T10:00:00", "2025-06-01T10:00:00");

        when(bookingService.bookVehicle(anyString(), any(BookingRequestDto.class)))
                .thenThrow(new BadRequestException("End date must be after start date"));

        // ── ACT + ASSERT ──────────────────────────────────────
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingController.bookVehicle(dto, authentication));

        assertTrue(ex.getMessage().contains("End date"));
    }

    @Test
    @DisplayName("Book Vehicle — conflicting booking: service throws BadRequestException")
    void bookVehicle_conflictingBooking_throwsBadRequestException() {
        // ── ARRANGE ───────────────────────────────────────────
        BookingRequestDto dto = buildBookingRequestDto(3L, "2025-06-01T10:00:00", "2025-06-05T10:00:00");

        when(bookingService.bookVehicle(anyString(), any(BookingRequestDto.class)))
                .thenThrow(new BadRequestException("Vehicle is not available for the selected time range"));

        // ── ACT + ASSERT ──────────────────────────────────────
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingController.bookVehicle(dto, authentication));

        assertTrue(ex.getMessage().contains("not available"));
    }

    @Test
    @DisplayName("Book Vehicle — vehicle not found: service throws ResourceNotFoundException")
    void bookVehicle_vehicleNotFound_throwsResourceNotFoundException() {
        // ── ARRANGE ───────────────────────────────────────────
        BookingRequestDto dto = buildBookingRequestDto(999L, "2025-06-01T10:00:00", "2025-06-05T10:00:00");

        when(bookingService.bookVehicle(anyString(), any(BookingRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("Vehicle not found with id: 999"));

        // ── ACT + ASSERT ──────────────────────────────────────
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> bookingController.bookVehicle(dto, authentication));

        assertTrue(ex.getMessage().contains("999"));
    }

    @Test
    @DisplayName("Book Vehicle — email extracted from Authentication correctly")
    void bookVehicle_usesEmailFromAuthentication() {
        // ── ARRANGE ───────────────────────────────────────────
        BookingRequestDto dto = buildBookingRequestDto(2L, "2025-07-01T10:00:00", "2025-07-05T10:00:00");
        BookingResponseDto mockResponse = buildBookingResponseDto(5L, 2L, "Honda Activa", "CONFIRMED");

        when(bookingService.bookVehicle(anyString(), any(BookingRequestDto.class)))
                .thenReturn(mockResponse);

        // ── ACT ───────────────────────────────────────────────
        bookingController.bookVehicle(dto, authentication);

        // ── ASSERT ────────────────────────────────────────────
        verify(bookingService).bookVehicle(eq("user@example.com"), eq(dto));
    }

    // =========================================================
    //  GET MY BOOKINGS TESTS
    // =========================================================

    @Test
    @DisplayName("Get My Bookings — success: returns 200 with list of bookings")
    void getMyBookings_authenticatedUser_returnsBookingList() {
        // ── ARRANGE ───────────────────────────────────────────
        List<BookingResponseDto> mockBookings = List.of(
                buildBookingResponseDto(1L, 3L, "Honda City", "CONFIRMED"),
                buildBookingResponseDto(2L, 4L, "Yamaha FZ", "COMPLETED")
        );

        when(bookingService.getMyBookings("user@example.com")).thenReturn(mockBookings);

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<List<BookingResponseDto>> response =
                bookingController.getMyBookings(authentication);

        // ── ASSERT ────────────────────────────────────────────
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Honda City", response.getBody().get(0).getVehicleName());

        verify(bookingService, times(1)).getMyBookings("user@example.com");
    }

    @Test
    @DisplayName("Get My Bookings — no bookings: returns 200 with empty list")
    void getMyBookings_noBookings_returnsEmptyList() {
        // ── ARRANGE ───────────────────────────────────────────
        when(bookingService.getMyBookings("user@example.com")).thenReturn(List.of());

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<List<BookingResponseDto>> response =
                bookingController.getMyBookings(authentication);

        // ── ASSERT ────────────────────────────────────────────
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    @DisplayName("Get My Bookings — user not found: throws ResourceNotFoundException")
    void getMyBookings_userNotFound_throwsResourceNotFoundException() {
        // ── ARRANGE ───────────────────────────────────────────
        when(bookingService.getMyBookings(anyString()))
                .thenThrow(new ResourceNotFoundException("User not found"));

        // ── ACT + ASSERT ──────────────────────────────────────
        assertThrows(ResourceNotFoundException.class,
                () -> bookingController.getMyBookings(authentication));
    }

    // =========================================================
    //  GET VEHICLE BOOKINGS (ADMIN) TESTS
    // =========================================================

    @Test
    @DisplayName("Get Vehicle Bookings — success: returns 200 with vehicle's booking list")
    void getVehicleBookings_validVehicleId_returnsBookingList() {
        // ── ARRANGE ───────────────────────────────────────────
        Long vehicleId = 3L;

        List<BookingResponseDto> mockBookings = List.of(
                buildBookingResponseDto(10L, vehicleId, "Honda City", "CONFIRMED"),
                buildBookingResponseDto(11L, vehicleId, "Honda City", "CANCELLED")
        );

        when(bookingService.getVehicleBookings(vehicleId)).thenReturn(mockBookings);

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<List<BookingResponseDto>> response =
                bookingController.getVehicleBookings(vehicleId);

        // ── ASSERT ────────────────────────────────────────────
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());

        verify(bookingService, times(1)).getVehicleBookings(vehicleId);
    }

    @Test
    @DisplayName("Get Vehicle Bookings — vehicle not found: throws ResourceNotFoundException")
    void getVehicleBookings_vehicleNotFound_throwsResourceNotFoundException() {
        // ── ARRANGE ───────────────────────────────────────────
        when(bookingService.getVehicleBookings(999L))
                .thenThrow(new ResourceNotFoundException("Vehicle not found with id: 999"));

        // ── ACT + ASSERT ──────────────────────────────────────
        assertThrows(ResourceNotFoundException.class,
                () -> bookingController.getVehicleBookings(999L));
    }

    // =========================================================
    //  GET ALL BOOKINGS (ADMIN) TESTS
    // =========================================================

    @Test
    @DisplayName("Get All Bookings — success: returns 200 with all bookings")
    void getAllBookings_adminUser_returnsAllBookings() {
        // ── ARRANGE ───────────────────────────────────────────
        List<BookingResponseDto> mockBookings = List.of(
                buildBookingResponseDto(1L, 3L, "Honda City", "CONFIRMED"),
                buildBookingResponseDto(2L, 4L, "Yamaha FZ", "COMPLETED"),
                buildBookingResponseDto(3L, 5L, "Royal Enfield", "CANCELLED")
        );

        when(bookingService.getAllBookings()).thenReturn(mockBookings);

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<List<BookingResponseDto>> response =
                bookingController.getAllBookings();

        // ── ASSERT ────────────────────────────────────────────
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().size());

        verify(bookingService, times(1)).getAllBookings();
    }

    @Test
    @DisplayName("Get All Bookings — no bookings in system: returns empty list")
    void getAllBookings_noBookingsExist_returnsEmptyList() {
        // ── ARRANGE ───────────────────────────────────────────
        when(bookingService.getAllBookings()).thenReturn(List.of());

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<List<BookingResponseDto>> response =
                bookingController.getAllBookings();

        // ── ASSERT ────────────────────────────────────────────
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    // =========================================================
    //  CANCEL BOOKING TESTS
    // =========================================================

    @Test
    @DisplayName("Cancel Booking — success: returns 200 with cancellation message")
    void cancelBooking_validBookingId_returnsCancelledMessage() {
        // ── ARRANGE ───────────────────────────────────────────
        Long bookingId = 5L;

        doNothing().when(bookingService).cancelBooking("user@example.com", bookingId);

        // ── ACT ───────────────────────────────────────────────
        ResponseEntity<String> response =
                bookingController.cancelBooking(bookingId, authentication);

        // ── ASSERT ────────────────────────────────────────────
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Booking cancelled successfully", response.getBody());

        verify(bookingService, times(1)).cancelBooking("user@example.com", bookingId);
    }

    @Test
    @DisplayName("Cancel Booking — booking not found: throws ResourceNotFoundException")
    void cancelBooking_bookingNotFound_throwsResourceNotFoundException() {
        // ── ARRANGE ───────────────────────────────────────────
        Long bookingId = 404L;

        doThrow(new ResourceNotFoundException("Booking not found with id: 404"))
                .when(bookingService).cancelBooking(anyString(), eq(bookingId));

        // ── ACT + ASSERT ──────────────────────────────────────
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> bookingController.cancelBooking(bookingId, authentication));

        assertTrue(ex.getMessage().contains("404"));
    }

    @Test
    @DisplayName("Cancel Booking — not owner: throws ForbiddenException")
    void cancelBooking_notOwner_throwsForbiddenException() {
        // ── ARRANGE ───────────────────────────────────────────
        Long bookingId = 7L;

        doThrow(new ForbiddenException("You can cancel only your own booking"))
                .when(bookingService).cancelBooking(anyString(), eq(bookingId));

        // ── ACT + ASSERT ──────────────────────────────────────
        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> bookingController.cancelBooking(bookingId, authentication));

        assertTrue(ex.getMessage().contains("only your own booking"));
    }

    @Test
    @DisplayName("Cancel Booking — already cancelled: throws BadRequestException")
    void cancelBooking_alreadyCancelled_throwsBadRequestException() {
        // ── ARRANGE ───────────────────────────────────────────
        Long bookingId = 9L;

        doThrow(new BadRequestException("Booking is already cancelled"))
                .when(bookingService).cancelBooking(anyString(), eq(bookingId));

        // ── ACT + ASSERT ──────────────────────────────────────
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingController.cancelBooking(bookingId, authentication));

        assertTrue(ex.getMessage().contains("already cancelled"));
    }

    @Test
    @DisplayName("Cancel Booking — after start date: throws BadRequestException")
    void cancelBooking_afterStartDate_throwsBadRequestException() {
        // ── ARRANGE ───────────────────────────────────────────
        Long bookingId = 11L;

        doThrow(new BadRequestException("Cannot cancel booking after start date"))
                .when(bookingService).cancelBooking(anyString(), eq(bookingId));

        // ── ACT + ASSERT ──────────────────────────────────────
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingController.cancelBooking(bookingId, authentication));

        assertTrue(ex.getMessage().contains("after start date"));
    }

    @Test
    @DisplayName("Cancel Booking — email extracted from Authentication correctly")
    void cancelBooking_usesEmailFromAuthentication() {
        // ── ARRANGE ───────────────────────────────────────────
        Long bookingId = 15L;
        doNothing().when(bookingService).cancelBooking(anyString(), eq(bookingId));

        // ── ACT ───────────────────────────────────────────────
        bookingController.cancelBooking(bookingId, authentication);

        // ── ASSERT ────────────────────────────────────────────
        verify(bookingService).cancelBooking(eq("user@example.com"), eq(15L));
    }

    // =========================================================
    //  HELPER METHODS
    // =========================================================

    private BookingRequestDto buildBookingRequestDto(Long vehicleId, String start, String end) {
        BookingRequestDto dto = new BookingRequestDto();
        dto.setVehicleId(vehicleId);
        dto.setStartDate(start);
        dto.setEndDate(end);
        return dto;
    }

    private BookingResponseDto buildBookingResponseDto(
            Long bookingId, Long vehicleId, String vehicleName, String status) {
        return new BookingResponseDto(
                bookingId, 1L, "test_user",
                vehicleId, vehicleName, "Car",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(5),
                status, LocalDateTime.now());
    }
}