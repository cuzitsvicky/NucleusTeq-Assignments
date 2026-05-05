package com.example.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.service.VehicleService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for public vehicle-browsing endpoints.
 */
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private static final Logger log = LoggerFactory.getLogger(VehicleController.class);

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /** GET /api/vehicles — list all vehicles. */
    @GetMapping
    public ResponseEntity<List<VehicleResponseDto>> getAllVehicles() {
        log.info("GET /api/vehicles");
        List<VehicleResponseDto> vehicles = vehicleService.getAllVehicles();
        log.debug("Returning {} vehicle(s)", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    /**
     * GET /api/vehicles/available — list available vehicles, optionally filtered by date range.
     * When start and end are provided, only vehicles with no booking conflicts are returned.
     */
    @GetMapping("/available")
    public ResponseEntity<List<VehicleResponseDto>> getAvailableVehicles(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        if (start != null && end != null) {
            log.info("GET /api/vehicles/available — date range filter: [{}, {}]", start, end);
            List<VehicleResponseDto> vehicles = vehicleService.getAvailableVehiclesForRange(start, end);
            log.debug("Returning {} available vehicle(s) for date range", vehicles.size());
            return ResponseEntity.ok(vehicles);
        }

        log.info("GET /api/vehicles/available — no date range (availability flag only)");
        List<VehicleResponseDto> vehicles = vehicleService.getAvailableVehicles();
        log.debug("Returning {} available vehicle(s)", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    /** GET /api/vehicles/{vehicleId} — get a single vehicle by ID. */
    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> getVehicleById(@PathVariable Long vehicleId) {
        log.info("GET /api/vehicles/{}", vehicleId);
        VehicleResponseDto vehicle = vehicleService.getVehicleById(vehicleId);
        return ResponseEntity.ok(vehicle);
    }
}