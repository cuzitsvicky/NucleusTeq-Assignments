package com.example.backend.controller;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.service.VehicleService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for handling vehicle-related endpoints, such as retrieving a list of all vehicles or a specific vehicle by ID.
 * Provides endpoints for users to browse available vehicles and for admins to manage the vehicle inventory.
 */
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * Returns a list of all vehicles in the system.
     */
    @GetMapping
    public ResponseEntity<List<VehicleResponseDto>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    /**
     * Returns vehicles that are marked available AND have no booking conflicts
     * in the requested time range. Used by the date-range filter on the frontend.
     */
    @GetMapping("/available")
    public ResponseEntity<List<VehicleResponseDto>> getAvailableVehicles(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
 
        if (start != null && end != null) {
            return ResponseEntity.ok(vehicleService.getAvailableVehiclesForRange(start, end));
        }
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    /**
     * Returns a specific vehicle by its ID.
     */
    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> getVehicleById(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleById(vehicleId));
    }
}

