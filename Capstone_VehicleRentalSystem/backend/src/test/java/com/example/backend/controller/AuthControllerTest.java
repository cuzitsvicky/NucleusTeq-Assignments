package com.example.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.security.AuthService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authService);
    }

    @Test
    void login_returnsServiceResponse() {
        LoginRequestDto request = loginRequest();
        LoginResponseDto serviceResponse =
                new LoginResponseDto("jwt-token", 1L, "john", "john@example.com", "USER");

        when(authService.login(request)).thenReturn(serviceResponse);

        ResponseEntity<LoginResponseDto> response = authController.login(request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(serviceResponse);
        verify(authService).login(request);
    }

    @Test
    void login_propagatesUnauthorizedException() {
        LoginRequestDto request = loginRequest();
        when(authService.login(request)).thenThrow(new UnauthorizedException("Invalid email or password"));

        assertThatThrownBy(() -> authController.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void signup_returnsServiceResponse() {
        SignupRequestDto request = signupRequest();
        SignUpResponseDto serviceResponse =
                new SignUpResponseDto(1L, "john", "john@example.com", "USER", LocalDateTime.now());

        when(authService.signup(request)).thenReturn(serviceResponse);

        ResponseEntity<SignUpResponseDto> response = authController.signup(request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(serviceResponse);
        verify(authService).signup(request);
    }

    @Test
    void signup_propagatesDuplicateResourceException() {
        SignupRequestDto request = signupRequest();
        when(authService.signup(request)).thenThrow(new DuplicateResourceException("Email already exists"));

        assertThatThrownBy(() -> authController.signup(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email already exists");
    }

    private static LoginRequestDto loginRequest() {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail("john@example.com");
        request.setPassword("secret123");
        return request;
    }

    private static SignupRequestDto signupRequest() {
        SignupRequestDto request = new SignupRequestDto();
        request.setUsername("john");
        request.setEmail("john@example.com");
        request.setPassword("secret123");
        request.setRole("USER");
        return request;
    }
}
