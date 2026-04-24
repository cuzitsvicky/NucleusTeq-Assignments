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

        vehicle.setAvailabilityStatus(false);
        vehicleRepository.save(vehicle);

        Booking saved = bookingRepository.save(booking);
        return mapToDto(saved);
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public List<BookingResponseDto> getMyBookings(String email) {
        User user = userService.findEntityByEmail(email);

        return bookingRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

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

        Vehicle vehicle = booking.getVehicle();
        vehicle.setAvailabilityStatus(true);
        vehicleRepository.save(vehicle);

    }

    public List<BookingResponseDto> getVehicleBookings(Long vehicleId) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        return bookingRepository.findByVehicle(vehicle).stream()
                .map(this::mapToDto)
                .toList();
    }

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

    private String formatVehicleType(VehicleType type) {
        return switch (type) {
            case CAR -> "Car";
            case BIKE -> "Bike";
        };
    }
}