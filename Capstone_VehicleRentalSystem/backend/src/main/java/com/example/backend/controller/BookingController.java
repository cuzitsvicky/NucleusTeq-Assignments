package com.example.backend.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.service.BookingService;

import java.util.List;

/**
 * Controller for booking-related endpoints.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** POST /api/bookings — book a vehicle. */
    @PostMapping
    public ResponseEntity<BookingResponseDto> bookVehicle(@Valid @RequestBody BookingRequestDto dto,
            Authentication authentication) {
        log.info("POST /api/bookings — user: {}, vehicleId: {}", authentication.getName(), dto.getVehicleId());
        BookingResponseDto response = bookingService.bookVehicle(authentication.getName(), dto);
        log.info("Booking confirmed — bookingId: {}", response.getBookingId());
        return ResponseEntity.ok(response);
    }

    /** GET /api/bookings/my-bookings — list bookings for the authenticated user. */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        log.info("GET /api/bookings/my-bookings — user: {}", authentication.getName());
        List<BookingResponseDto> bookings = bookingService.getMyBookings(authentication.getName());
        log.debug("Returning {} booking(s) for user: {}", bookings.size(), authentication.getName());
        return ResponseEntity.ok(bookings);
    }

    /** GET /api/bookings/vehicle/{vehicleId} — list bookings for a vehicle (admin). */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<BookingResponseDto>> getVehicleBookings(@PathVariable Long vehicleId) {
        log.info("GET /api/bookings/vehicle/{}", vehicleId);
        List<BookingResponseDto> bookings = bookingService.getVehicleBookings(vehicleId);
        log.debug("Returning {} booking(s) for vehicleId: {}", bookings.size(), vehicleId);
        return ResponseEntity.ok(bookings);
    }

    /** GET /api/bookings/all — list all bookings (admin). */
    @GetMapping("/all")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        log.info("GET /api/bookings/all");
        List<BookingResponseDto> bookings = bookingService.getAllBookings();
        log.debug("Returning {} total booking(s)", bookings.size());
        return ResponseEntity.ok(bookings);
    }

    /** DELETE /api/bookings/{bookingId} — cancel a booking. */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
        log.info("DELETE /api/bookings/{} — user: {}", bookingId, authentication.getName());
        bookingService.cancelBooking(authentication.getName(), bookingId);
        log.info("Booking cancelled — bookingId: {}", bookingId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}