package com.example.backend.controller;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.service.BookingService;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponseDto> bookVehicle(@Valid @RequestBody BookingRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.bookVehicle(authentication.getName(), dto));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookings(authentication.getName()));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<BookingResponseDto>> getVehicleBookings(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(bookingService.getVehicleBookings(vehicleId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
        bookingService.cancelBooking(authentication.getName(), bookingId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}
