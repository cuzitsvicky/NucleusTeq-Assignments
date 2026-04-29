package com.example.backend.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.service.VehicleService;

/**
 * Controller for admin-specific operations: add, update, and delete vehicles.
 * All endpoints require the ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final VehicleService vehicleService;

    public AdminController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /** POST /api/admin/vehicles — add a new vehicle. */
    @PostMapping("/vehicles")
    public ResponseEntity<VehicleResponseDto> addVehicle(@Valid @RequestBody VehicleRequestDto dto,
            Authentication authentication) {
        log.info("POST /api/admin/vehicles — admin: {}, vehicleName: {}", authentication.getName(), dto.getName());
        VehicleResponseDto response = vehicleService.addVehicle(authentication.getName(), dto);
        log.info("Vehicle added — vehicleId: {}", response.getVehicleId());
        return ResponseEntity.ok(response);
    }

    /** PUT /api/admin/vehicles/{vehicleId} — update an existing vehicle. */
    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> updateVehicle(@PathVariable Long vehicleId,
            @Valid @RequestBody VehicleRequestDto dto, Authentication authentication) {
        log.info("PUT /api/admin/vehicles/{} — admin: {}", vehicleId, authentication.getName());
        VehicleResponseDto response = vehicleService.updateVehicle(authentication.getName(), vehicleId, dto);
        log.info("Vehicle updated — vehicleId: {}", vehicleId);
        return ResponseEntity.ok(response);
    }

    /** DELETE /api/admin/vehicles/{vehicleId} — delete a vehicle. */
    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long vehicleId) {
        log.info("DELETE /api/admin/vehicles/{}", vehicleId);
        vehicleService.deleteVehicle(vehicleId);
        log.info("Vehicle deleted — vehicleId: {}", vehicleId);
        return ResponseEntity.ok("Vehicle deleted successfully");
    }
}