package com.example.backend.service;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Booking;
import com.example.backend.model.User;
import com.example.backend.model.Vehicle;
import com.example.backend.model.Vehicle.VehicleType;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VehicleRepository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for handling booking-related operations, such as creating a new booking, retrieving bookings for a user,
 * retrieving all bookings for admins, and cancelling bookings. Contains business logic to ensure that bookings
 * are valid, vehicles are available, and users have the necessary permissions to perform actions on bookings.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserService userService;

    public BookingService(BookingRepository bookingRepository,
                          VehicleRepository vehicleRepository,
                          UserService userService) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userService = userService;
    }

    /**
     * Creates a new booking for a vehicle. Validates that the vehicle exists, the requested time range is valid,
     * and that there are no conflicting bookings for the same vehicle. Only authenticated users can create bookings.
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public BookingResponseDto bookVehicle(String email, BookingRequestDto dto) {

        User user = userService.findEntityByEmail(email);

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + dto.getVehicleId()));

        LocalDateTime startDate;
        LocalDateTime endDate;

        try {
            startDate = LocalDateTime.parse(dto.getStartDate());
            endDate = LocalDateTime.parse(dto.getEndDate());
        } catch (Exception ex) {
            throw new com.example.backend.exception.BadRequestException("Date format must be yyyy-MM-ddTHH:mm:ss");
        }

        LocalDateTime now = LocalDateTime.now();

        if (startDate.isBefore(now)) {
            throw new com.example.backend.exception.BadRequestException("Start date must be present or future");
        }

        if (!endDate.isAfter(startDate)) {
            throw new com.example.backend.exception.BadRequestException("End date must be after start date");
        }

        List<Booking> conflicts = bookingRepository
                .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                        vehicle,
                        List.of(Booking.Status.PENDING, Booking.Status.CONFIRMED),
                        endDate,
                        startDate);

        if (!conflicts.isEmpty()) {
            throw new com.example.backend.exception.BadRequestException("Vehicle is not available for the selected time range");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setStatus(Booking.Status.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        return mapToDto(saved);
    }

    /* Method to retrieve bookings for the currently authenticated user. Validates that the user is authenticated and
     * automatically marks any expired bookings as COMPLETED before returning the list of bookings for the user.
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<BookingResponseDto> getMyBookings(String email) {
        User user = userService.findEntityByEmail(email);
        List<Booking> bookings = bookingRepository.findByUser(user);
        autoCompleteExpired(bookings);
        return bookings.stream().map(this::mapToDto).toList();
    }

    /* Admin method to retrieve all bookings in the system. Validates that the requesting user has admin privileges and
     * automatically marks any expired bookings as COMPLETED before returning the list of all bookings.
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponseDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        autoCompleteExpired(bookings);
        return bookings.stream().map(this::mapToDto).toList();
    }

    /* Method to cancel a booking. Validates that the booking exists, that the requesting user is either the owner of the
    * booking or an admin, that the booking is not already cancelled, and that the start date has not passed. If all
    * checks pass, the booking status is updated to CANCELLED.
    */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public void cancelBooking(String email, Long bookingId) {
        User user = userService.findEntityByEmail(email);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        boolean isOwner = booking.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new com.example.backend.exception.ForbiddenException("You can cancel only your own booking");
        }

        if (booking.getStatus() == Booking.Status.CANCELLED) {
            throw new com.example.backend.exception.BadRequestException("Booking is already cancelled");
        }

        if (LocalDateTime.now().isAfter(booking.getStartDate())) {
            throw new com.example.backend.exception.BadRequestException("Cannot cancel booking after start date");
        }

        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);
    }
    
    /* Admin method to retrieve all bookings for a specific vehicle. Validates that the vehicle exists and that the
     * requesting user has admin privileges. Automatically marks any expired bookings as COMPLETED before returning
     * the list of bookings for the vehicle.
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponseDto> getVehicleBookings(Long vehicleId) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        List<Booking> bookings = bookingRepository.findByVehicle(vehicle);
        autoCompleteExpired(bookings);
        return bookings.stream().map(this::mapToDto).toList();
    }
    
    /* Helper method to automatically mark bookings as COMPLETED if their end date has passed and they are still in PENDING or CONFIRMED status */
    private void autoCompleteExpired(List<Booking> bookings) {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> toSave = bookings.stream()
                .filter(b ->
                        (b.getStatus() == Booking.Status.CONFIRMED || b.getStatus() == Booking.Status.PENDING)
                        && b.getEndDate().isBefore(now))
                .toList();
 
        if (!toSave.isEmpty()) {
            toSave.forEach(b -> b.setStatus(Booking.Status.COMPLETED));
            bookingRepository.saveAll(toSave);
        }
    }
    
    /* Helper method to convert Booking entity to BookingResponseDto for API responses */
    private BookingResponseDto mapToDto(Booking booking) {
        return new BookingResponseDto(
                booking.getBookingId(),
                booking.getUser().getUserId(),
                booking.getUser().getUsername(),
                booking.getVehicle().getVehicleId(),
                booking.getVehicle().getName(),
                formatVehicleType(booking.getVehicle().getType()),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getStatus().name(),
                booking.getCreatedAt());
    }

    /* Helper method to convert VehicleType enum to a user-friendly string for the response DTO */
    private String formatVehicleType(VehicleType type) {
        return switch (type) {
            case CAR -> "Car";
            case BIKE -> "Bike";
        };
    }
}