package com.example.backend.controller;

import com.example.backend.dto.request.VehicleRequestDto;
import com.example.backend.dto.response.VehicleResponseDto;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.VehicleService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 *  AdminControllerTest — Pure Unit Tests (no Spring context)
 *
 *  Tests the AdminController in isolation by mocking VehicleService.
 *  Covers add, update, and delete vehicle operations including
 *  happy paths and exception propagation.
 */
class AdminControllerTest {

    /* Mocks */
    @Mock
    private VehicleService vehicleService;

    @Mock
    private Authentication authentication;

    /* The class we are actually testing */
    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        /* Admin email extracted from the JWT via Authentication */
        when(authentication.getName()).thenReturn("admin@example.com");
    }

    /* ADD VEHICLE TESTS */

    @Test
    @DisplayName("Add Vehicle — success: returns 200 with VehicleResponseDto")
    void addVehicle_validRequest_returnsVehicleResponse() {
        /* ARRANGE */
        VehicleRequestDto dto = buildVehicleRequestDto("Honda City", "Car");

        VehicleResponseDto mockResponse = buildVehicleResponseDto(1L, "Honda City", "Car");

        when(vehicleService.addVehicle("admin@example.com", dto)).thenReturn(mockResponse);

        /* ACT */
        ResponseEntity<VehicleResponseDto> response =
                adminController.addVehicle(dto, authentication);

        /* ASSERT */
        assertNotNull(response, "Response should not be null");
        assertEquals(200, response.getStatusCode().value(), "HTTP status should be 200 OK");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertEquals(1L, response.getBody().getVehicleId());
        assertEquals("Honda City", response.getBody().getName());
        assertEquals("Car", response.getBody().getType());

        verify(vehicleService, times(1)).addVehicle("admin@example.com", dto);
    }

    @Test
    @DisplayName("Add Vehicle — service called with correct admin email from Authentication")
    void addVehicle_usesEmailFromAuthentication() {
        /* ARRANGE */
        VehicleRequestDto dto = buildVehicleRequestDto("Royal Enfield", "Bike");
        VehicleResponseDto mockResponse = buildVehicleResponseDto(2L, "Royal Enfield", "Bike");

        when(vehicleService.addVehicle(anyString(), any(VehicleRequestDto.class)))
                .thenReturn(mockResponse);

        /* ACT */
        adminController.addVehicle(dto, authentication);

        /* ASSERT */
        /* Verify authentication.getName() was used as admin email */
        verify(vehicleService).addVehicle(eq("admin@example.com"), eq(dto));
    }

    @Test
    @DisplayName("Add Vehicle — Bike type: returns correct type in response")
    void addVehicle_bikeType_returnsCorrectType() {
        /* ARRANGE */
        VehicleRequestDto dto = buildVehicleRequestDto("Royal Enfield Classic 350", "Bike");
        dto.setDescription("Retro-style touring motorcycle");

        VehicleResponseDto mockResponse = buildVehicleResponseDto(3L, "Royal Enfield Classic 350", "Bike");

        when(vehicleService.addVehicle(anyString(), any(VehicleRequestDto.class)))
                .thenReturn(mockResponse);

        /* ACT */
        ResponseEntity<VehicleResponseDto> response =
                adminController.addVehicle(dto, authentication);

        /* ASSERT */
        assertNotNull(response.getBody());
        assertEquals("Bike", response.getBody().getType());
    }

    @Test
    @DisplayName("Add Vehicle — service throws ResourceNotFoundException: propagates")
    void addVehicle_serviceThrows_propagatesException() {
        /* ARRANGE */
        VehicleRequestDto dto = buildVehicleRequestDto("Ghost Admin", "Car");

        when(vehicleService.addVehicle(anyString(), any(VehicleRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("Admin user not found"));

        /* ACT + ASSERT */
        assertThrows(ResourceNotFoundException.class,
                () -> adminController.addVehicle(dto, authentication));
    }


    /* UPDATE VEHICLE TESTS */

    @Test
    @DisplayName("Update Vehicle — success: returns 200 with updated VehicleResponseDto")
    void updateVehicle_validRequest_returnsUpdatedResponse() {
        /* ARRANGE */
        Long vehicleId = 5L;
        VehicleRequestDto dto = buildVehicleRequestDto("Honda City Updated", "Car");

        VehicleResponseDto mockResponse = buildVehicleResponseDto(vehicleId, "Honda City Updated", "Car");

        when(vehicleService.updateVehicle("admin@example.com", vehicleId, dto))
                .thenReturn(mockResponse);

        /* ACT */
        ResponseEntity<VehicleResponseDto> response =
                adminController.updateVehicle(vehicleId, dto, authentication);

        /* ASSERT */
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(vehicleId, response.getBody().getVehicleId());
        assertEquals("Honda City Updated", response.getBody().getName());

        verify(vehicleService, times(1)).updateVehicle("admin@example.com", vehicleId, dto);
    }

    @Test
    @DisplayName("Update Vehicle — vehicle not found: throws ResourceNotFoundException")
    void updateVehicle_vehicleNotFound_throwsResourceNotFoundException() {
        /* ARRANGE */
        Long vehicleId = 999L;
        VehicleRequestDto dto = buildVehicleRequestDto("Ghost Vehicle", "Car");

        when(vehicleService.updateVehicle(anyString(), eq(vehicleId), any(VehicleRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("Vehicle not found with id: 999"));

        /* ACT + ASSERT */
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> adminController.updateVehicle(vehicleId, dto, authentication));

        assertTrue(ex.getMessage().contains("999"));
    }

    @Test
    @DisplayName("Update Vehicle — service called with correct vehicleId, adminEmail, and dto")
    void updateVehicle_correctArgumentsPassedToService() {
        /* ARRANGE */
        Long vehicleId = 7L;
        VehicleRequestDto dto = buildVehicleRequestDto("Yamaha FZ", "Bike");
        dto.setAvailabilityStatus(false);

        VehicleResponseDto mockResponse = buildVehicleResponseDto(vehicleId, "Yamaha FZ", "Bike");

        when(vehicleService.updateVehicle(anyString(), anyLong(), any(VehicleRequestDto.class)))
                .thenReturn(mockResponse);

        /* ACT */
        adminController.updateVehicle(vehicleId, dto, authentication);

        /* ASSERT */
        verify(vehicleService).updateVehicle(
                eq("admin@example.com"),
                eq(7L),
                argThat(d -> "Yamaha FZ".equals(d.getName()) && "Bike".equals(d.getType()))
        );
    }

    /**  DELETE VEHICLE TESTS */

    @Test
    @DisplayName("Delete Vehicle — success: returns 200 with success message")
    void deleteVehicle_validId_returnsSuccessMessage() {
        /* ARRANGE */
        Long vehicleId = 3L;

        doNothing().when(vehicleService).deleteVehicle(vehicleId);

        /* ACT */
        ResponseEntity<String> response = adminController.deleteVehicle(vehicleId);

        /* ASSERT */
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Vehicle deleted successfully", response.getBody());

        verify(vehicleService, times(1)).deleteVehicle(vehicleId);
    }

    @Test
    @DisplayName("Delete Vehicle — vehicle not found: throws ResourceNotFoundException")
    void deleteVehicle_vehicleNotFound_throwsResourceNotFoundException() {
        /* ARRANGE */
        Long vehicleId = 404L;

        doThrow(new ResourceNotFoundException("Vehicle not found with id: 404"))
                .when(vehicleService).deleteVehicle(vehicleId);

        /* ACT + ASSERT */
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> adminController.deleteVehicle(vehicleId));

        assertTrue(ex.getMessage().contains("404"));
    }

    @Test
    @DisplayName("Delete Vehicle — active bookings: throws BadRequestException")
    void deleteVehicle_hasActiveBookings_throwsBadRequestException() {
        /* ARRANGE */
        Long vehicleId = 8L;

        doThrow(new BadRequestException("Cannot delete vehicle with active or upcoming bookings"))
                .when(vehicleService).deleteVehicle(vehicleId);

        /* ACT + ASSERT */
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> adminController.deleteVehicle(vehicleId));

        assertTrue(ex.getMessage().contains("active or upcoming bookings"));
    }

    @Test
    @DisplayName("Delete Vehicle — deleteVehicle called exactly once with correct vehicleId")
    void deleteVehicle_serviceCalledOnce() {
        /* ARRANGE */
        Long vehicleId = 10L;
        doNothing().when(vehicleService).deleteVehicle(vehicleId);

        /* ACT */
        adminController.deleteVehicle(vehicleId);

        /* ASSERT */
        verify(vehicleService, times(1)).deleteVehicle(10L);
        verify(vehicleService, never()).deleteVehicle(99L); // Not called with wrong ID
    }

    /**  HELPER METHODS */

    private VehicleRequestDto buildVehicleRequestDto(String name, String type) {
        VehicleRequestDto dto = new VehicleRequestDto();
        dto.setName(name);
        dto.setType(type);
        dto.setDescription("Test description");
        dto.setAvailabilityStatus(true);
        return dto;
    }

    private VehicleResponseDto buildVehicleResponseDto(Long id, String name, String type) {
        return new VehicleResponseDto(
                id, name, type, "Test description",
                true, 1L, "admin_user", LocalDateTime.now());
    }
}