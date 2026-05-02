package com.example.backend.controller;

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

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 *  VehicleControllerTest — Pure Unit Tests (no Spring context)
 *
 *  Tests the VehicleController in isolation by mocking VehicleService.
 *  Covers: get all vehicles, get available vehicles (with and without
 *  date range), and get vehicle by ID — including error cases.
 */
class VehicleControllerTest {

    /**  Mocks */
    @Mock
    private VehicleService vehicleService;

    /**  The class we are actually testing — all dependencies are mocked. */
    @InjectMocks
    private VehicleController vehicleController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**  GET ALL VEHICLES TESTS */

    @Test
    @DisplayName("Get All Vehicles — success: returns 200 with full vehicle list")
    void getAllVehicles_vehiclesExist_returnsFullList() {
        // ── ARRANGE ───────────────────────────────────────────
        List<VehicleResponseDto> mockVehicles = List.of(
                buildVehicleResponseDto(1L, "Honda City", "Car", true),
                buildVehicleResponseDto(2L, "Royal Enfield", "Bike", false),
                buildVehicleResponseDto(3L, "Toyota Fortuner", "Car", true)
        );

        when(vehicleService.getAllVehicles()).thenReturn(mockVehicles);

        /**  ACT  */
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAllVehicles();

        /**  ASSERT  */
        assertNotNull(response, "Response should not be null");
        assertEquals(200, response.getStatusCode().value(), "HTTP status should be 200 OK");
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().size());
        assertEquals("Honda City", response.getBody().get(0).getName());
        assertEquals("Royal Enfield", response.getBody().get(1).getName());

        verify(vehicleService, times(1)).getAllVehicles();
    }

    @Test
    @DisplayName("Get All Vehicles — no vehicles: returns 200 with empty list")
    void getAllVehicles_noVehiclesExist_returnsEmptyList() {
        /**  ARRANGE  */
        when(vehicleService.getAllVehicles()).thenReturn(List.of());

        /**  ACT  */
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAllVehicles();

        /**  ASSERT  */
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    @DisplayName("Get All Vehicles — includes both available and unavailable vehicles")
    void getAllVehicles_returnsBothAvailableAndUnavailable() {
        /**  ARRANGE  */
        List<VehicleResponseDto> mockVehicles = List.of(
                buildVehicleResponseDto(1L, "Honda City", "Car", true),
                buildVehicleResponseDto(2L, "Yamaha FZ", "Bike", false)
        );

        when(vehicleService.getAllVehicles()).thenReturn(mockVehicles);

        /**  ACT  */
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAllVehicles();

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertTrue(response.getBody().get(0).isAvailabilityStatus(),  "First vehicle should be available");
        assertFalse(response.getBody().get(1).isAvailabilityStatus(), "Second vehicle should be unavailable");
    }

    /**  GET AVAILABLE VEHICLES (no date range) TESTS */

    @Test
    @DisplayName("Get Available Vehicles — no date params: returns availability-flag filtered list")
    void getAvailableVehicles_noDateRange_returnsAvailableVehicles() {
        /**  ARRANGE  */
        List<VehicleResponseDto> mockVehicles = List.of(
                buildVehicleResponseDto(1L, "Honda City", "Car", true),
                buildVehicleResponseDto(3L, "Toyota Fortuner", "Car", true)
        );

        when(vehicleService.getAvailableVehicles()).thenReturn(mockVehicles);

        /**  ACT  */
        // Passing null for start/end triggers the simple availability flag path
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAvailableVehicles(null, null);

        /**  ASSERT  */
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertTrue(response.getBody().stream().allMatch(VehicleResponseDto::isAvailabilityStatus),
                "All returned vehicles should have availabilityStatus=true");

        verify(vehicleService, times(1)).getAvailableVehicles();
        verify(vehicleService, never()).getAvailableVehiclesForRange(any(), any());
    }

    @Test
    @DisplayName("Get Available Vehicles — no date params: no vehicles available returns empty list")
    void getAvailableVehicles_noDateRange_noVehiclesAvailable_returnsEmptyList() {
        /**  ARRANGE  */
        when(vehicleService.getAvailableVehicles()).thenReturn(List.of());

        /**  ACT  */
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAvailableVehicles(null, null);

        /**  ASSERT  */
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    /**  GET AVAILABLE VEHICLES (with date range) TESTS */

    @Test
    @DisplayName("Get Available Vehicles — with date range: delegates to getAvailableVehiclesForRange")
    void getAvailableVehicles_withDateRange_callsRangeMethod() {
        /**  ARRANGE  */
        LocalDateTime start = LocalDateTime.of(2025, 6, 1, 10, 0);
        LocalDateTime end   = LocalDateTime.of(2025, 6, 5, 10, 0);

        List<VehicleResponseDto> mockVehicles = List.of(
                buildVehicleResponseDto(1L, "Honda City", "Car", true)
        );

        when(vehicleService.getAvailableVehiclesForRange(start, end)).thenReturn(mockVehicles);

        /**  ACT  */
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAvailableVehicles(start, end);

        /**  ASSERT  */
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Honda City", response.getBody().get(0).getName());

        /**  Verify the range method was called — NOT the simple availability method */
        verify(vehicleService, times(1)).getAvailableVehiclesForRange(start, end);
        verify(vehicleService, never()).getAvailableVehicles();
    }

    @Test
    @DisplayName("Get Available Vehicles — with date range: no conflicts returns all available vehicles")
    void getAvailableVehicles_withDateRange_noConflicts_returnsAllAvailable() {
        /**  ARRANGE  */
        LocalDateTime start = LocalDateTime.of(2025, 7, 1, 9, 0);
        LocalDateTime end   = LocalDateTime.of(2025, 7, 7, 9, 0);

        List<VehicleResponseDto> mockVehicles = List.of(
                buildVehicleResponseDto(1L, "Honda City",     "Car",  true),
                buildVehicleResponseDto(2L, "Yamaha FZ",      "Bike", true),
                buildVehicleResponseDto(3L, "Royal Enfield",  "Bike", true)
        );

        when(vehicleService.getAvailableVehiclesForRange(start, end)).thenReturn(mockVehicles);

        /**  ACT  */
        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAvailableVehicles(start, end);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().size());
    }

    @Test
    @DisplayName("Get Available Vehicles — with date range: end before start throws BadRequestException")
    void getAvailableVehicles_withDateRange_invalidRange_throwsBadRequestException() {
        /**  ARRANGE  */
        LocalDateTime start = LocalDateTime.of(2025, 6, 10, 10, 0);
        LocalDateTime end   = LocalDateTime.of(2025, 6, 5, 10, 0); // end before start

        when(vehicleService.getAvailableVehiclesForRange(start, end))
                .thenThrow(new BadRequestException("End date must be after start date"));

        /**  ACT + ASSERT  */
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> vehicleController.getAvailableVehicles(start, end));

        assertTrue(ex.getMessage().contains("End date"));
    }

    @Test
    @DisplayName("Get Available Vehicles — only start provided: uses simple availability path")
    void getAvailableVehicles_onlyStartProvided_usesSimpleAvailability() {
        /**  ARRANGE  */
        /**  When only one of start/end is provided the controller falls back to simple availability.  */
        when(vehicleService.getAvailableVehicles()).thenReturn(List.of());

        ResponseEntity<List<VehicleResponseDto>> response =
                vehicleController.getAvailableVehicles(LocalDateTime.now(), null);

        verify(vehicleService, times(1)).getAvailableVehicles();
        verify(vehicleService, never()).getAvailableVehiclesForRange(any(), any());
        assertEquals(200, response.getStatusCode().value());
    }

    /**  GET VEHICLE BY ID TESTS  */

    @Test
    @DisplayName("Get Vehicle By ID — success: returns 200 with vehicle details")
    void getVehicleById_validId_returnsVehicleResponse() {
        /**  ARRANGE  */
        Long vehicleId = 3L;
        VehicleResponseDto mockResponse = buildVehicleResponseDto(vehicleId, "Honda City", "Car", true);

        when(vehicleService.getVehicleById(vehicleId)).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<VehicleResponseDto> response =
                vehicleController.getVehicleById(vehicleId);

        /**  ASSERT  */
        assertNotNull(response, "Response should not be null");
        assertEquals(200, response.getStatusCode().value(), "HTTP status should be 200 OK");
        assertNotNull(response.getBody());
        assertEquals(vehicleId, response.getBody().getVehicleId());
        assertEquals("Honda City", response.getBody().getName());
        assertEquals("Car", response.getBody().getType());
        assertTrue(response.getBody().isAvailabilityStatus());

        verify(vehicleService, times(1)).getVehicleById(vehicleId);
    }

    @Test
    @DisplayName("Get Vehicle By ID — vehicle not found: throws ResourceNotFoundException")
    void getVehicleById_vehicleNotFound_throwsResourceNotFoundException() {
        /**  ARRANGE  */
        Long vehicleId = 999L;

        when(vehicleService.getVehicleById(vehicleId))
                .thenThrow(new ResourceNotFoundException("Vehicle not found with id: 999"));

        /**  ACT + ASSERT  */
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> vehicleController.getVehicleById(vehicleId));

        assertTrue(ex.getMessage().contains("999"));
    }

    @Test
    @DisplayName("Get Vehicle By ID — Bike type: returns correct type in response")
    void getVehicleById_bikeVehicle_returnsCorrectType() {
        /**  ARRANGE  */
        Long vehicleId = 7L;
        VehicleResponseDto mockResponse = buildVehicleResponseDto(vehicleId, "Royal Enfield Classic 350", "Bike", true);

        when(vehicleService.getVehicleById(vehicleId)).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<VehicleResponseDto> response =
                vehicleController.getVehicleById(vehicleId);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals("Bike", response.getBody().getType());
    }

    @Test
    @DisplayName("Get Vehicle By ID — unavailable vehicle: availabilityStatus is false")
    void getVehicleById_unavailableVehicle_returnsCorrectStatus() {
        /**  ARRANGE  */
        Long vehicleId = 5L;
        VehicleResponseDto mockResponse = buildVehicleResponseDto(vehicleId, "Maruti Swift", "Car", false);

        when(vehicleService.getVehicleById(vehicleId)).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<VehicleResponseDto> response =
                vehicleController.getVehicleById(vehicleId);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isAvailabilityStatus(),
                "Unavailable vehicle should have availabilityStatus=false");
    }

    @Test
    @DisplayName("Get Vehicle By ID — service called exactly once with correct ID")
    void getVehicleById_serviceCalledOnce() {
        /**  ARRANGE  */
        Long vehicleId = 2L;
        VehicleResponseDto mockResponse = buildVehicleResponseDto(vehicleId, "Yamaha FZ", "Bike", true);

        when(vehicleService.getVehicleById(vehicleId)).thenReturn(mockResponse);

        /**  ACT  */
        vehicleController.getVehicleById(vehicleId);

        /**  ASSERT  */
        verify(vehicleService, times(1)).getVehicleById(2L);
        verify(vehicleService, never()).getVehicleById(99L); // Not called with wrong ID
    }

    /**  HELPER METHODS */

    private VehicleResponseDto buildVehicleResponseDto(
            Long id, String name, String type, boolean available) {
        return new VehicleResponseDto(
                id, name, type, "Test description",
                available, 1L, "admin_user", LocalDateTime.now());
    }
}