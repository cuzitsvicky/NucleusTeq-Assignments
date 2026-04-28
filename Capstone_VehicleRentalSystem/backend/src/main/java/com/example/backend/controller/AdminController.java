package com.example.backend.controller;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.service.VehicleService;


/**
 * Controller for admin-specific operations, such as adding, updating, and deleting vehicles.
 * All endpoints in this controller should be secured to allow only users with the ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final VehicleService vehicleService;

    public AdminController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * Endpoint for adding a new vehicle. Accepts a VehicleRequestDto containing the vehicle details,
     * and returns a VehicleResponseDto with the details of the created vehicle.
     */
    @PostMapping("/vehicles")
    public ResponseEntity<VehicleResponseDto> addVehicle(@Valid @RequestBody VehicleRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(vehicleService.addVehicle(authentication.getName(), dto));
    }

    /**
     * Endpoint for updating an existing vehicle. Accepts a VehicleRequestDto containing the updated vehicle details,
     * and returns a VehicleResponseDto with the details of the updated vehicle.
     */
    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> updateVehicle(@PathVariable Long vehicleId,
            @Valid @RequestBody VehicleRequestDto dto, Authentication authentication) {
        return ResponseEntity.ok(vehicleService.updateVehicle(authentication.getName(), vehicleId, dto));
    }

    /**
     * Endpoint for deleting a vehicle. Accepts the vehicle ID as a path variable,
     * and returns a success message upon successful deletion.
     */
    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok("Vehicle deleted successfully");
    }
}
