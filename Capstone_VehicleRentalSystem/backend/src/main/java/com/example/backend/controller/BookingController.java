package com.example.backend.controller;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.service.BookingService;
import java.util.List;

/**
 * Controller for handling booking-related endpoints, such as creating a new booking, viewing user bookings,
 * and canceling bookings. Provides endpoints for users to manage their vehicle rentals and for admins to view all bookings.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Endpoint for booking a vehicle. Accepts a BookingRequestDto containing the vehicle ID and rental period,
     * and returns a BookingResponseDto with the details of the created booking.
     */
    @PostMapping
    public ResponseEntity<BookingResponseDto> bookVehicle(@Valid @RequestBody BookingRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.bookVehicle(authentication.getName(), dto));
    }

    /**
     * Returns a list of bookings associated with the authenticated user.
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookings(authentication.getName()));
    }

    /**
     * Returns a list of bookings for a specific vehicle.
     */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<BookingResponseDto>> getVehicleBookings(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(bookingService.getVehicleBookings(vehicleId));
    }

    /**
     * Returns a list of all bookings in the system.
     */
    @GetMapping("/all")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /**
     * Cancels a booking by its ID.
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
        bookingService.cancelBooking(authentication.getName(), bookingId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}
