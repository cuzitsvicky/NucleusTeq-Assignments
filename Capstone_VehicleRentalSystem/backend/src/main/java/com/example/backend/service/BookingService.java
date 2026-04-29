package com.example.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.example.backend.dto.request.BookingRequestDto;
import com.example.backend.dto.response.BookingResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ForbiddenException;
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
 * retrieving all bookings for admins, and cancelling bookings.
 */
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

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
     * Creates a new booking for a vehicle.
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public BookingResponseDto bookVehicle(String email, BookingRequestDto dto) {
        log.info("Booking request — user: {}, vehicleId: {}, start: {}, end: {}",
                email, dto.getVehicleId(), dto.getStartDate(), dto.getEndDate());

        User user = userService.findEntityByEmail(email);

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> {
                    log.warn("Booking failed — vehicle not found with id: {}", dto.getVehicleId());
                    return new ResourceNotFoundException("Vehicle not found with id: " + dto.getVehicleId());
                });

        LocalDateTime startDate;
        LocalDateTime endDate;

        try {
            startDate = LocalDateTime.parse(dto.getStartDate());
            endDate   = LocalDateTime.parse(dto.getEndDate());
        } catch (Exception ex) {
            log.warn("Booking failed — invalid date format. start: {}, end: {}", dto.getStartDate(), dto.getEndDate());
            throw new BadRequestException("Date format must be yyyy-MM-ddTHH:mm:ss");
        }

        LocalDateTime now = LocalDateTime.now();

        if (startDate.isBefore(now)) {
            log.warn("Booking failed — start date is in the past: {}", startDate);
            throw new BadRequestException("Start date must be present or future");
        }

        if (!endDate.isAfter(startDate)) {
            log.warn("Booking failed — end date {} is not after start date {}", endDate, startDate);
            throw new BadRequestException("End date must be after start date");
        }

        List<Booking> conflicts = bookingRepository
                .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                        vehicle,
                        List.of(Booking.Status.PENDING, Booking.Status.CONFIRMED),
                        endDate,
                        startDate);

        if (!conflicts.isEmpty()) {
            log.warn("Booking failed — vehicleId: {} has {} conflicting booking(s) for range [{}, {}]",
                    vehicle.getVehicleId(), conflicts.size(), startDate, endDate);
            throw new BadRequestException("Vehicle is not available for the selected time range");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setStatus(Booking.Status.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created — bookingId: {}, userId: {}, vehicleId: {}, status: {}",
                saved.getBookingId(), user.getUserId(), vehicle.getVehicleId(), saved.getStatus());

        return mapToDto(saved);
    }

    /**
     * Retrieves bookings for the currently authenticated user.
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<BookingResponseDto> getMyBookings(String email) {
        log.info("Fetching bookings for user: {}", email);
        User user = userService.findEntityByEmail(email);
        List<Booking> bookings = bookingRepository.findByUser(user);
        autoCompleteExpired(bookings);
        log.debug("Found {} booking(s) for user: {}", bookings.size(), email);
        return bookings.stream().map(this::mapToDto).toList();
    }

    /**
     * Admin method to retrieve all bookings in the system.
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponseDto> getAllBookings() {
        log.info("Admin request — fetching all bookings");
        List<Booking> bookings = bookingRepository.findAll();
        autoCompleteExpired(bookings);
        log.debug("Total bookings found: {}", bookings.size());
        return bookings.stream().map(this::mapToDto).toList();
    }

    /**
     * Cancels a booking by ID.
     */
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public void cancelBooking(String email, Long bookingId) {
        log.info("Cancel booking request — user: {}, bookingId: {}", email, bookingId);

        User user = userService.findEntityByEmail(email);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> {
                    log.warn("Cancel failed — booking not found with id: {}", bookingId);
                    return new ResourceNotFoundException("Booking not found with id: " + bookingId);
                });

        boolean isOwner = booking.getUser().getUserId().equals(user.getUserId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            log.warn("Cancel forbidden — user: {} is not the owner or admin for bookingId: {}", email, bookingId);
            throw new ForbiddenException("You can cancel only your own booking");
        }

        if (booking.getStatus() == Booking.Status.CANCELLED) {
            log.warn("Cancel failed — bookingId: {} is already cancelled", bookingId);
            throw new BadRequestException("Booking is already cancelled");
        }

        if (LocalDateTime.now().isAfter(booking.getStartDate())) {
            log.warn("Cancel failed — bookingId: {} has already started (startDate: {})", bookingId, booking.getStartDate());
            throw new BadRequestException("Cannot cancel booking after start date");
        }

        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);
        log.info("Booking cancelled successfully — bookingId: {}, cancelledBy: {}", bookingId, email);
    }

    /**
     * Admin method to retrieve all bookings for a specific vehicle.
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponseDto> getVehicleBookings(Long vehicleId) {
        log.info("Admin request — fetching bookings for vehicleId: {}", vehicleId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> {
                    log.warn("Vehicle not found with id: {}", vehicleId);
                    return new ResourceNotFoundException("Vehicle not found with id: " + vehicleId);
                });

        List<Booking> bookings = bookingRepository.findByVehicle(vehicle);
        autoCompleteExpired(bookings);
        log.debug("Found {} booking(s) for vehicleId: {}", bookings.size(), vehicleId);
        return bookings.stream().map(this::mapToDto).toList();
    }

    /**
     * Automatically marks expired bookings as COMPLETED.
     */
    private void autoCompleteExpired(List<Booking> bookings) {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> toSave = bookings.stream()
                .filter(b ->
                        (b.getStatus() == Booking.Status.CONFIRMED || b.getStatus() == Booking.Status.PENDING)
                        && b.getEndDate().isBefore(now))
                .toList();

        if (!toSave.isEmpty()) {
            log.info("Auto-completing {} expired booking(s)", toSave.size());
            toSave.forEach(b -> {
                b.setStatus(Booking.Status.COMPLETED);
                log.debug("Marking bookingId: {} as COMPLETED (endDate: {})", b.getBookingId(), b.getEndDate());
            });
            bookingRepository.saveAll(toSave);
        }
    }

    /** Helper: convert Booking entity to response DTO. */
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

    /** Helper: convert VehicleType enum to display string. */
    private String formatVehicleType(VehicleType type) {
        return switch (type) {
            case CAR  -> "Car";
            case BIKE -> "Bike";
        };
    }
}