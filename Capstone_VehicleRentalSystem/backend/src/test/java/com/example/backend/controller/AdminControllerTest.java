package com.example.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.VehicleService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private VehicleService vehicleService;

    @Mock
    private Authentication authentication;

    private AdminController adminController;

    @BeforeEach
    void setUp() {
        adminController = new AdminController(vehicleService);
    }

    @Test
    void addVehicle_returnsServiceResponse() {
        VehicleRequestDto request = vehicleRequest();
        VehicleResponseDto serviceResponse = vehicleResponse(1L);

        when(authentication.getName()).thenReturn("admin@example.com");
        when(vehicleService.addVehicle("admin@example.com", request)).thenReturn(serviceResponse);

        ResponseEntity<VehicleResponseDto> response = adminController.addVehicle(request, authentication);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(serviceResponse);
        verify(vehicleService).addVehicle("admin@example.com", request);
    }

    @Test
    void addVehicle_propagatesServiceException() {
        VehicleRequestDto request = vehicleRequest();
        when(authentication.getName()).thenReturn("admin@example.com");
        when(vehicleService.addVehicle("admin@example.com", request))
                .thenThrow(new ResourceNotFoundException("Admin user not found"));

        assertThatThrownBy(() -> adminController.addVehicle(request, authentication))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Admin user not found");
    }

    @Test
    void updateVehicle_returnsServiceResponse() {
        VehicleRequestDto request = vehicleRequest();
        VehicleResponseDto serviceResponse = vehicleResponse(5L);

        when(authentication.getName()).thenReturn("admin@example.com");
        when(vehicleService.updateVehicle("admin@example.com", 5L, request)).thenReturn(serviceResponse);

        ResponseEntity<VehicleResponseDto> response = adminController.updateVehicle(5L, request, authentication);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(serviceResponse);
        verify(vehicleService).updateVehicle("admin@example.com", 5L, request);
    }

    @Test
    void updateVehicle_propagatesServiceException() {
        VehicleRequestDto request = vehicleRequest();
        when(authentication.getName()).thenReturn("admin@example.com");
        when(vehicleService.updateVehicle("admin@example.com", 404L, request))
                .thenThrow(new ResourceNotFoundException("Vehicle not found"));

        assertThatThrownBy(() -> adminController.updateVehicle(404L, request, authentication))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Vehicle not found");
    }

    @Test
    void deleteVehicle_returnsSuccessMessage() {
        ResponseEntity<String> response = adminController.deleteVehicle(3L);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("Vehicle deleted successfully");
        verify(vehicleService).deleteVehicle(3L);
    }

    @Test
    void deleteVehicle_propagatesServiceException() {
        doThrow(new BadRequestException("Cannot delete vehicle with active bookings"))
                .when(vehicleService).deleteVehicle(3L);

        assertThatThrownBy(() -> adminController.deleteVehicle(3L))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Cannot delete vehicle with active bookings");
    }

    private static VehicleRequestDto vehicleRequest() {
        VehicleRequestDto request = new VehicleRequestDto();
        request.setName("Honda City");
        request.setType("Car");
        request.setDescription("Comfortable sedan");
        request.setAvailabilityStatus(true);
        return request;
    }

    private static VehicleResponseDto vehicleResponse(Long id) {
        return new VehicleResponseDto(
                id, "Honda City", "Car", "Comfortable sedan", true, 1L, "admin", LocalDateTime.now());
    }
}
