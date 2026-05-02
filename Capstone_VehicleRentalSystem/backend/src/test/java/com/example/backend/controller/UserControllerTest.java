package com.example.backend.controller;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.UserService;

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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 *  UserControllerTest — Pure Unit Tests (no Spring context)
 *
 *  Tests the UserController in isolation by mocking UserService.
 *  Covers the GET /api/users/me endpoint for USER and ADMIN roles,
 *  as well as exception propagation when the user is not found.
 */
class UserControllerTest {

    /**  Mocks */
    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    /**  The class we are actually testing — all dependencies are mocked. */
    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(authentication.getName()).thenReturn("user@example.com");
    }

    /**  GET CURRENT USER TESTS */

    @Test
    @DisplayName("Get Current User — success: returns 200 with user profile")
    void getCurrentUser_validToken_returnsUserProfile() {
        /**  ARRANGE  */
        SignUpResponseDto mockResponse = new SignUpResponseDto(
                1L, "john_doe", "user@example.com", "USER", LocalDateTime.now());

        when(userService.getCurrentUser("user@example.com")).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<SignUpResponseDto> response =
                userController.getCurrentUser(authentication);

        /**  ASSERT  */
        assertNotNull(response, "Response should not be null");
        assertEquals(200, response.getStatusCode().value(), "HTTP status should be 200 OK");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertEquals(1L, response.getBody().getUserId());
        assertEquals("john_doe", response.getBody().getUsername());
        assertEquals("user@example.com", response.getBody().getEmail());
        assertEquals("USER", response.getBody().getRole());

        verify(userService, times(1)).getCurrentUser("user@example.com");
    }

    @Test
    @DisplayName("Get Current User — ADMIN role: returns profile with ADMIN role")
    void getCurrentUser_adminUser_returnsAdminProfile() {
        /**  ARRANGE  */
        when(authentication.getName()).thenReturn("admin@example.com");

        SignUpResponseDto mockResponse = new SignUpResponseDto(
                2L, "admin_user", "admin@example.com", "ADMIN", LocalDateTime.now());

        when(userService.getCurrentUser("admin@example.com")).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<SignUpResponseDto> response =
                userController.getCurrentUser(authentication);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals("ADMIN", response.getBody().getRole(),
                "Admin user's role in response should be ADMIN");
        assertEquals("admin@example.com", response.getBody().getEmail());

        verify(userService, times(1)).getCurrentUser("admin@example.com");
    }

    @Test
    @DisplayName("Get Current User — user not found: throws ResourceNotFoundException")
    void getCurrentUser_userNotFound_throwsResourceNotFoundException() {
        /**  ARRANGE  */
        when(userService.getCurrentUser(anyString()))
                .thenThrow(new ResourceNotFoundException("User not found with email: user@example.com"));

        /**  ACT + ASSERT  */
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> userController.getCurrentUser(authentication));

        assertTrue(ex.getMessage().contains("user@example.com"));
    }

    @Test
    @DisplayName("Get Current User — email extracted from Authentication")
    void getCurrentUser_usesEmailFromAuthentication() {
        /**  ARRANGE  */
        SignUpResponseDto mockResponse = new SignUpResponseDto(
                1L, "john_doe", "user@example.com", "USER", LocalDateTime.now());

        when(userService.getCurrentUser(anyString())).thenReturn(mockResponse);

        /**  ACT  */
        userController.getCurrentUser(authentication);

        /**  ASSERT  */
        /**  Confirm the controller passed authentication.getName() to the service —
         * not a hardcoded or default email.
         */
        verify(userService).getCurrentUser(eq("user@example.com"));
        verify(authentication, atLeastOnce()).getName();
    }

    @Test
    @DisplayName("Get Current User — createdAt timestamp is present in response")
    void getCurrentUser_responseContainsCreatedAt() {
        /**  ARRANGE  */
        LocalDateTime registeredAt = LocalDateTime.of(2025, 1, 10, 8, 0);

        SignUpResponseDto mockResponse = new SignUpResponseDto(
                5L, "test_user", "user@example.com", "USER", registeredAt);

        when(userService.getCurrentUser(anyString())).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<SignUpResponseDto> response =
                userController.getCurrentUser(authentication);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getCreatedAt(), "createdAt should not be null in response");
        assertEquals(registeredAt, response.getBody().getCreatedAt());
    }

    @Test
    @DisplayName("Get Current User — service called exactly once")
    void getCurrentUser_serviceCalledExactlyOnce() {
        /**  ARRANGE  */
        SignUpResponseDto mockResponse = new SignUpResponseDto(
                1L, "john_doe", "user@example.com", "USER", LocalDateTime.now());

        when(userService.getCurrentUser(anyString())).thenReturn(mockResponse);

        /**  ACT  */
        userController.getCurrentUser(authentication);
        userController.getCurrentUser(authentication); // called twice

        /**  ASSERT  */
        verify(userService, times(2)).getCurrentUser("user@example.com");
    }
}