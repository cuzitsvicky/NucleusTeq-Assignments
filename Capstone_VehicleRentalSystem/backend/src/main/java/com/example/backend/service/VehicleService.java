package com.example.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * Service for handling vehicle-related operations.
 */
@Service
public class VehicleService {

    private static final Logger log = LoggerFactory.getLogger(VehicleService.class);

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

    /** Retrieves a list of all vehicles in the system. */
    public List<VehicleResponseDto> getAllVehicles() {
        log.info("Fetching all vehicles");
        List<VehicleResponseDto> vehicles = vehicleRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
        log.debug("Total vehicles found: {}", vehicles.size());
        return vehicles;
    }

    /** Returns vehicles marked as available. */
    public List<VehicleResponseDto> getAvailableVehicles() {
        log.info("Fetching available vehicles (no date range)");
        List<VehicleResponseDto> vehicles = vehicleRepository.findByAvailabilityStatusTrue().stream()
                .map(this::mapToDto)
                .toList();
        log.debug("Available vehicles found: {}", vehicles.size());
        return vehicles;
    }

    /** Returns available vehicles with no booking conflicts in the given date range. */
    public List<VehicleResponseDto> getAvailableVehiclesForRange(LocalDateTime start, LocalDateTime end) {
        log.info("Fetching available vehicles for range [{}, {}]", start, end);

        if (!end.isAfter(start)) {
            log.warn("Invalid date range — end: {} is not after start: {}", end, start);
            throw new BadRequestException("End date must be after start date");
        }

        List<VehicleResponseDto> vehicles = vehicleRepository.findByAvailabilityStatusTrue().stream()
                .filter(vehicle -> {
                    List<Booking> conflicts = bookingRepository
                            .findByVehicleAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
                                    vehicle,
                                    List.of(Booking.Status.CONFIRMED, Booking.Status.PENDING),
                                    end,
                                    start);
                    boolean available = conflicts.isEmpty();
                    if (!available) {
                        log.debug("Vehicle {} is not available for range [{}, {}] due to {} conflict(s)",
                                vehicle.getVehicleId(), start, end, conflicts.size());
                    }
                    return available;
                })
                .map(this::mapToDto)
                .toList();

        log.info("Available vehicles for range [{}, {}]: {}", start, end, vehicles.size());
        return vehicles;
    }

    /** Retrieves a specific vehicle by its ID. */
    public VehicleResponseDto getVehicleById(Long vehicleId) {
        log.info("Fetching vehicle by id: {}", vehicleId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> {
                    log.warn("Vehicle not found with id: {}", vehicleId);
                    return new ResourceNotFoundException("Vehicle not found with id: " + vehicleId);
                });

        log.debug("Vehicle found — id: {}, name: {}, type: {}", vehicleId, vehicle.getName(), vehicle.getType());
        return mapToDto(vehicle);
    }

    /** Admin: add a new vehicle. */
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleResponseDto addVehicle(String email, VehicleRequestDto dto) {
        log.info("Admin {} is adding a new vehicle — name: {}, type: {}", email, dto.getName(), dto.getType());

        User admin = userService.findEntityByEmail(email);

        Vehicle vehicle = new Vehicle();
        vehicle.setName(dto.getName());
        vehicle.setType(parseVehicleType(dto.getType()));
        vehicle.setDescription(dto.getDescription());
        vehicle.setAvailabilityStatus(dto.getAvailabilityStatus() == null || dto.getAvailabilityStatus());
        vehicle.setAddedBy(admin);

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle added — vehicleId: {}, name: {}, type: {}, addedBy: {}",
                saved.getVehicleId(), saved.getName(), saved.getType(), email);

        return mapToDto(saved);
    }

    /** Admin: update an existing vehicle. */
    @PreAuthorize("hasRole('ADMIN')")
    public VehicleResponseDto updateVehicle(String email, Long vehicleId, VehicleRequestDto dto) {
        log.info("Admin {} is updating vehicleId: {}", email, vehicleId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> {
                    log.warn("Update failed — vehicle not found with id: {}", vehicleId);
                    return new ResourceNotFoundException("Vehicle not found with id: " + vehicleId);
                });

        vehicle.setName(dto.getName());
        vehicle.setType(parseVehicleType(dto.getType()));
        vehicle.setDescription(dto.getDescription());

        if (dto.getAvailabilityStatus() != null) {
            vehicle.setAvailabilityStatus(dto.getAvailabilityStatus());
            log.debug("Vehicle {} availability status updated to: {}", vehicleId, dto.getAvailabilityStatus());
        }

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Vehicle updated successfully — vehicleId: {}, name: {}, type: {}", vehicleId, updated.getName(), updated.getType());
        return mapToDto(updated);
    }

    /** Admin: delete a vehicle. */
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVehicle(Long vehicleId) {
        log.info("Delete request for vehicleId: {}", vehicleId);

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> {
                    log.warn("Delete failed — vehicle not found with id: {}", vehicleId);
                    return new ResourceNotFoundException("Vehicle not found with id: " + vehicleId);
                });

        if (hasActiveOrUpcomingBooking(vehicle)) {
            log.warn("Delete denied — vehicleId: {} has active or upcoming bookings", vehicleId);
            throw new BadRequestException("Cannot delete vehicle with active or upcoming bookings");
        }

        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted successfully — vehicleId: {}, name: {}", vehicleId, vehicle.getName());
    }

    /** Checks if a vehicle has any active or upcoming confirmed/pending bookings. */
    private boolean hasActiveOrUpcomingBooking(Vehicle vehicle) {
        List<Booking> bookings = bookingRepository.findByVehicle(vehicle);
        LocalDateTime now = LocalDateTime.now();
        boolean hasActive = bookings.stream().anyMatch(b ->
                (b.getStatus() == Booking.Status.CONFIRMED || b.getStatus() == Booking.Status.PENDING)
                        && b.getEndDate().isAfter(now));
        log.debug("Vehicle {} has active/upcoming bookings: {}", vehicle.getVehicleId(), hasActive);
        return hasActive;
    }

    /** Parses a string to VehicleType with validation. */
    private VehicleType parseVehicleType(String type) {
        if ("Car".equalsIgnoreCase(type))  return VehicleType.CAR;
        if ("Bike".equalsIgnoreCase(type)) return VehicleType.BIKE;
        log.warn("Invalid vehicle type received: {}", type);
        throw new BadRequestException("Vehicle type must be either Car or Bike");
    }

    /** Converts Vehicle entity to response DTO. */
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

    /** Converts VehicleType enum to display string. */
    private String formatVehicleType(VehicleType type) {
        return switch (type) {
            case CAR  -> "Car";
            case BIKE -> "Bike";
        };
    }
}