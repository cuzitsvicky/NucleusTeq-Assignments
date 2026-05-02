package com.example.backend.controller;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.security.AuthService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 *  AuthControllerTest — Pure Unit Tests (no Spring context)
 *
 *  Tests the AuthController in isolation by mocking AuthService.
 *  Covers signup and login happy paths, error propagation,
 *  and role-based token handling.
 */
class AuthControllerTest {

    /**  Mock (fake version of the only dependency)  */
    @Mock
    private AuthService authService;

    /**  The class we are actually testing  */
    @InjectMocks
    private AuthController authController;

    /**  SETUP — runs before every @Test  */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**  LOGIN TESTS */

    @Test
    @DisplayName("Login — success: valid credentials return JWT token")
    void login_validCredentials_returnsToken() {
        /**  ARRANGE  */
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("john@example.com");
        request.setPassword("secret123");

        LoginResponseDto mockResponse = new LoginResponseDto(
                "mocked.jwt.token", 1L, "john_doe", "john@example.com", "USER");

        when(authService.login(any(LoginRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<LoginResponseDto> response = authController.login(request);

        /**  ASSERT  */
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertEquals(200, response.getStatusCode().value(), "HTTP status should be 200 OK");
        assertEquals("mocked.jwt.token", response.getBody().getToken(),
                "Token in response should match the generated token");
        assertEquals("john@example.com", response.getBody().getEmail());
        assertEquals("USER", response.getBody().getRole());

        verify(authService, times(1)).login(any(LoginRequestDto.class));
    }

    @Test
    @DisplayName("Login — failure: wrong password throws UnauthorizedException")
    void login_wrongPassword_throwsUnauthorizedException() {
        /**  ARRANGE  */
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("john@example.com");
        request.setPassword("wrongpassword");

        when(authService.login(any(LoginRequestDto.class)))
                .thenThrow(new UnauthorizedException("Invalid email or password"));

        /**  ACT + ASSERT  */
        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> authController.login(request),
                "Should throw UnauthorizedException for wrong password");

        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    @DisplayName("Login — failure: unknown email throws UnauthorizedException")
    void login_unknownEmail_throwsUnauthorizedException() {
        /**  ARRANGE  */
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("unknown@example.com");
        request.setPassword("anypassword");

        when(authService.login(any(LoginRequestDto.class)))
                .thenThrow(new UnauthorizedException("Invalid email or password"));

        /**  ACT + ASSERT  */
        assertThrows(UnauthorizedException.class, () -> authController.login(request));

        verify(authService, times(1)).login(any(LoginRequestDto.class));
    }

    @Test
    @DisplayName("Login — ADMIN role: token contains correct ADMIN role")
    void login_adminUser_tokenHasCorrectRole() {
        /**  ARRANGE  */
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("admin@example.com");
        request.setPassword("adminpass");

        LoginResponseDto mockResponse = new LoginResponseDto(
                "admin.jwt.token", 2L, "admin_user", "admin@example.com", "ADMIN");

        when(authService.login(any(LoginRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<LoginResponseDto> response = authController.login(request);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals("admin.jwt.token", response.getBody().getToken());
        assertEquals("ADMIN", response.getBody().getRole(),
                "Role in response must be ADMIN, not USER");

        verify(authService, times(1)).login(any(LoginRequestDto.class));
    }

    @Test
    @DisplayName("Login — response contains correct userId and username")
    void login_success_responseContainsUserDetails() {
        /**  ARRANGE  */
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("john@example.com");
        request.setPassword("secret123");

        LoginResponseDto mockResponse = new LoginResponseDto(
                "token.value", 42L, "john_doe", "john@example.com", "USER");

        when(authService.login(any(LoginRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<LoginResponseDto> response = authController.login(request);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals(42L, response.getBody().getUserId());
        assertEquals("john_doe", response.getBody().getUsername());
    }

    /**  SIGNUP TESTS */

    @Test
    @DisplayName("Signup — success: returns SignUpResponseDto with userId")
    void signup_validRequest_returnsSignUpResponse() {
        /**  ARRANGE  */
        SignupRequestDto dto = buildValidSignupDto("neha@example.com");

        SignUpResponseDto mockResponse = new SignUpResponseDto(
                10L, "neha_user", "neha@example.com", "USER", LocalDateTime.now());

        when(authService.signup(any(SignupRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<SignUpResponseDto> response = authController.signup(dto);

        /**  ASSERT  */
        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getBody(), "Response body should not be null");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(10L, response.getBody().getUserId());
        assertEquals("neha@example.com", response.getBody().getEmail());

        verify(authService, times(1)).signup(any(SignupRequestDto.class));
    }

    @Test
    @DisplayName("Signup — duplicate email: service throws DuplicateResourceException")
    void signup_duplicateEmail_throwsDuplicateResourceException() {
        /**  ARRANGE  */
        SignupRequestDto dto = buildValidSignupDto("existing@example.com");

        when(authService.signup(any(SignupRequestDto.class)))
                .thenThrow(new DuplicateResourceException("Email already exists"));

        /**  ACT + ASSERT  */
        DuplicateResourceException ex = assertThrows(
                DuplicateResourceException.class,
                () -> authController.signup(dto));

        assertEquals("Email already exists", ex.getMessage());
    }

    @Test
    @DisplayName("Signup — USER role: response contains role USER")
    void signup_userRole_responseContainsUserRole() {
        /**  ARRANGE  */
        SignupRequestDto dto = buildValidSignupDto("newuser@example.com");
        dto.setRole("USER");

        SignUpResponseDto mockResponse = new SignUpResponseDto(
                5L, "newuser", "newuser@example.com", "USER", LocalDateTime.now());

        when(authService.signup(any(SignupRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<SignUpResponseDto> response = authController.signup(dto);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals("USER", response.getBody().getRole());
    }

    @Test
    @DisplayName("Signup — ADMIN role: response contains role ADMIN")
    void signup_adminRole_responseContainsAdminRole() {
        /**  ARRANGE  */
        SignupRequestDto dto = buildValidSignupDto("admin@example.com");
        dto.setRole("ADMIN");

        SignUpResponseDto mockResponse = new SignUpResponseDto(
                6L, "admin_user", "admin@example.com", "ADMIN", LocalDateTime.now());

        when(authService.signup(any(SignupRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        ResponseEntity<SignUpResponseDto> response = authController.signup(dto);

        /**  ASSERT  */
        assertNotNull(response.getBody());
        assertEquals("ADMIN", response.getBody().getRole());
    }

    @Test
    @DisplayName("Signup — authService called with exact DTO values")
    void signup_correctDtoPassedToService() {
        /**  ARRANGE  */
        SignupRequestDto dto = buildValidSignupDto("check@example.com");

        SignUpResponseDto mockResponse = new SignUpResponseDto(
                1L, "check_user", "check@example.com", "USER", LocalDateTime.now());

        when(authService.signup(any(SignupRequestDto.class))).thenReturn(mockResponse);

        /**  ACT  */
        authController.signup(dto);

        /**  ASSERT  */
        verify(authService).signup(argThat(d ->
                "check@example.com".equals(d.getEmail()) &&
                "check_user".equals(d.getUsername())
        ));
    }

    /**  HELPER METHODS  */

    private SignupRequestDto buildValidSignupDto(String email) {
        SignupRequestDto dto = new SignupRequestDto();
        dto.setUsername("check_user");
        dto.setEmail(email);
        dto.setPassword("password123");
        dto.setRole("USER");
        return dto;
    }
}