package com.example.backend.controller;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.service.VehicleService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final VehicleService vehicleService;

    public AdminController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleResponseDto> addVehicle(@Valid @RequestBody VehicleRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(vehicleService.addVehicle(authentication.getName(), dto));
    }

    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<VehicleResponseDto> updateVehicle(@PathVariable Long vehicleId,
            @Valid @RequestBody VehicleRequestDto dto, Authentication authentication) {
        return ResponseEntity.ok(vehicleService.updateVehicle(authentication.getName(), vehicleId, dto));
    }

    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok("Vehicle deleted successfully");
    }
}
