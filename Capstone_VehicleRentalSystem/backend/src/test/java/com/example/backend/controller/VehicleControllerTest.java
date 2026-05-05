package com.example.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.VehicleService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock
    private VehicleService vehicleService;

    private VehicleController vehicleController;

    @BeforeEach
    void setUp() {
        vehicleController = new VehicleController(vehicleService);
    }

    @Test
    void getAllVehicles_returnsServiceList() {
        List<VehicleResponseDto> vehicles = List.of(vehicle(1L));
        when(vehicleService.getAllVehicles()).thenReturn(vehicles);

        ResponseEntity<List<VehicleResponseDto>> response = vehicleController.getAllVehicles();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(vehicles);
        verify(vehicleService).getAllVehicles();
    }

    @Test
    void getAvailableVehicles_withoutDates_usesSimpleAvailability() {
        List<VehicleResponseDto> vehicles = List.of(vehicle(1L));
        when(vehicleService.getAvailableVehicles()).thenReturn(vehicles);

        ResponseEntity<List<VehicleResponseDto>> response = vehicleController.getAvailableVehicles(null, null);

        assertThat(response.getBody()).isSameAs(vehicles);
        verify(vehicleService).getAvailableVehicles();
        verify(vehicleService, never()).getAvailableVehiclesForRange(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void getAvailableVehicles_withDates_usesRangeAvailability() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(3);
        List<VehicleResponseDto> vehicles = List.of(vehicle(1L));

        when(vehicleService.getAvailableVehiclesForRange(start, end)).thenReturn(vehicles);

        ResponseEntity<List<VehicleResponseDto>> response = vehicleController.getAvailableVehicles(start, end);

        assertThat(response.getBody()).isSameAs(vehicles);
        verify(vehicleService).getAvailableVehiclesForRange(start, end);
        verify(vehicleService, never()).getAvailableVehicles();
    }

    @Test
    void getVehicleById_returnsServiceResponse() {
        VehicleResponseDto vehicle = vehicle(7L);
        when(vehicleService.getVehicleById(7L)).thenReturn(vehicle);

        ResponseEntity<VehicleResponseDto> response = vehicleController.getVehicleById(7L);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(vehicle);
        verify(vehicleService).getVehicleById(7L);
    }

    @Test
    void getVehicleById_propagatesServiceException() {
        when(vehicleService.getVehicleById(404L)).thenThrow(new ResourceNotFoundException("Vehicle not found"));

        assertThatThrownBy(() -> vehicleController.getVehicleById(404L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Vehicle not found");
    }

    private static VehicleResponseDto vehicle(Long id) {
        return new VehicleResponseDto(
                id, "Honda City", "Car", "Comfortable sedan", true, 1L, "admin", LocalDateTime.now());
    }
}
