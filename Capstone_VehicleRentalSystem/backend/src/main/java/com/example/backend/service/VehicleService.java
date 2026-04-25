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

    public List<VehicleResponseDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<VehicleResponseDto> getAvailableVehicles() {
        return vehicleRepository.findByAvailabilityStatusTrue().stream()
                .map(this::mapToDto)
                .toList();
    }

    public VehicleResponseDto getVehicleById(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        return mapToDto(vehicle);
    }

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

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVehicle(Long vehicleId) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (hasActiveOrUpcomingBooking(vehicle)) {
            throw new BadRequestException("Cannot delete vehicle with active or upcoming bookings");
        }

        vehicleRepository.delete(vehicle);
    }

    private boolean hasActiveOrUpcomingBooking(Vehicle vehicle) {
        List<Booking> bookings = bookingRepository.findByVehicle(vehicle);
        LocalDateTime now = LocalDateTime.now();
        return bookings.stream().anyMatch(b ->
                (b.getStatus() == Booking.Status.CONFIRMED || b.getStatus() == Booking.Status.PENDING)
                        && b.getEndDate().isAfter(now));
    }

    private VehicleType parseVehicleType(String type) {
        if ("Car".equalsIgnoreCase(type)) return VehicleType.CAR;
        if ("Bike".equalsIgnoreCase(type)) return VehicleType.BIKE;
        throw new BadRequestException("Vehicle type must be either Car or Bike");
    }

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

    private String formatVehicleType(VehicleType type) {
        return switch (type) {
            case CAR -> "Car";
            case BIKE -> "Bike";
        };
    }
}