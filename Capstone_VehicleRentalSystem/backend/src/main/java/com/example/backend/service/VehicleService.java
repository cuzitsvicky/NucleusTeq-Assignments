package com.example.backend.service;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.exception.BadRequestException;
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
 * Service for handling vehicle-related operations, such as retrieving a list of all vehicles or a specific vehicle by ID.
 * Provides endpoints for users to browse available vehicles and for admins to manage the vehicle inventory.
 */
@Service
public class VehicleService {


    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final UserService userService;

    public VehicleService(VehicleRepository vehicleRepository,
                          BookingRepository bookingRepository,
                          UserService userService) {
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.userService = userService;
    }

    /* Retrieves a list of all vehicles in the system. This method is used for displaying the full inventory of vehicles
     * to users and admins. It converts Vehicle entities to VehicleResponseDto for API responses.
     */
    public List<VehicleResponseDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    /* Returns vehicles that are marked available, regardless of booking conflicts. Used for the "Available Now" filter on the frontend. */
    public List<VehicleResponseDto> getAvailableVehicles() {
        return vehicleRepository.findByAvailabilityStatusTrue().stream()
                .map(this::mapToDto)
                .toList();
    }

    /* Returns vehicles that are marked available AND have no booking conflicts
     * in the requested time range. Used by the date-range filter on the frontend.
     */
    public List<VehicleResponseDto> getAvailableVehiclesForRange(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw new BadRequestException("End date must be after start date");
        }

        return vehicleRepository.findByAvailabilityStatusTrue().stream()
                .filter(vehicle -> {
                    List<Booking> conflicts = bookingRepository
                            .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                                    vehicle,
                                    List.of(Booking.Status.CONFIRMED, Booking.Status.PENDING),
                                    end,
                                    start);
                    return conflicts.isEmpty();
                })
                .map(this::mapToDto)
                .toList();
    }

    /* Retrieves a specific vehicle by its ID. Validates that the vehicle exists and returns its details as a DTO.
     * This method is used for displaying vehicle details on the frontend when a user clicks on a vehicle.
     */
    public VehicleResponseDto getVehicleById(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        return mapToDto(vehicle);
    }

    /* Admin method to add a new vehicle. Validates the input data and creates a new vehicle record in the database.
     * Only users with admin role can perform this action. The availability status defaults to true if not provided.
     */
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleResponseDto addVehicle(String email, VehicleRequestDto dto) {
        User admin = userService.findEntityByEmail(email);

        Vehicle vehicle = new Vehicle();
        vehicle.setName(dto.getName());
        vehicle.setType(parseVehicleType(dto.getType()));
        vehicle.setDescription(dto.getDescription());
        vehicle.setAvailabilityStatus(dto.getAvailabilityStatus() == null || dto.getAvailabilityStatus());
        vehicle.setAddedBy(admin);

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDto(saved);
    }

    /* Admin method to update an existing vehicle. Validates that the vehicle exists and updates its details based on the provided DTO.
     * Only users with admin role can perform this action. The availability status can be updated, but if it's not provided in the DTO,
     * it will default to true (available).
     */
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleResponseDto updateVehicle(String email, Long vehicleId, VehicleRequestDto dto) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        vehicle.setName(dto.getName());
        vehicle.setType(parseVehicleType(dto.getType()));
        vehicle.setDescription(dto.getDescription());

        if (dto.getAvailabilityStatus() != null) {
            vehicle.setAvailabilityStatus(dto.getAvailabilityStatus());
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        return mapToDto(updated);
    }

    /* Admin method to delete a vehicle. Validates that the vehicle exists and that there are no active or upcoming bookings
     * for the vehicle before allowing deletion. Only users with admin role can perform this action.
     */
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVehicle(Long vehicleId) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (hasActiveOrUpcomingBooking(vehicle)) {
            throw new BadRequestException("Cannot delete vehicle with active or upcoming bookings");
        }

        vehicleRepository.delete(vehicle);
    }

    /* Helper method to check if a vehicle has any active or upcoming bookings. This is used to prevent deletion of vehicles
     * that are currently booked or have future bookings. It checks for bookings with status PENDING or CONFIRMED that
     * have an end date in the future.
     */
    private boolean hasActiveOrUpcomingBooking(Vehicle vehicle) {
        List<Booking> bookings = bookingRepository.findByVehicle(vehicle);
        LocalDateTime now = LocalDateTime.now();
        return bookings.stream().anyMatch(b ->
                (b.getStatus() == Booking.Status.CONFIRMED || b.getStatus() == Booking.Status.PENDING)
                        && b.getEndDate().isAfter(now));
    }

    /* Helper method to convert string input to VehicleType enum, with validation */
    private VehicleType parseVehicleType(String type) {
        if ("Car".equalsIgnoreCase(type)) return VehicleType.CAR;
        if ("Bike".equalsIgnoreCase(type)) return VehicleType.BIKE;
        throw new BadRequestException("Vehicle type must be either Car or Bike");
    }

    /* Helper method to convert Vehicle entity to VehicleResponseDto for API responses */
    private VehicleResponseDto mapToDto(Vehicle vehicle) {
        return new VehicleResponseDto(
                vehicle.getVehicleId(),
                vehicle.getName(),
                formatVehicleType(vehicle.getType()),
                vehicle.getDescription(),
                vehicle.isAvailabilityStatus(),
                vehicle.getAddedBy().getUserId(),
                vehicle.getAddedBy().getUsername(),
                vehicle.getCreatedAt());
    }

    /* Helper method to convert VehicleType enum to a user-friendly string for the response DTO */
    private String formatVehicleType(VehicleType type) {
        return switch (type) {
            case CAR -> "Car";
            case BIKE -> "Bike";
        };
    }
}