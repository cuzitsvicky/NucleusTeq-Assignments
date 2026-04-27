package com.example.backend.controller;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.service.VehicleService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponseDto>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    // Returns vehicles that are marked available AND have no booking conflicts
    // in the requested time range. Used by the date-range filter on the frontend.
    @GetMapping("/available")
    public ResponseEntity<List<VehicleResponseDto>> getAvailableVehicles(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
 
        if (start != null && end != null) {
            return ResponseEntity.ok(vehicleService.getAvailableVehiclesForRange(start, end));
        }
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> getVehicleById(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleById(vehicleId));
    }
}

