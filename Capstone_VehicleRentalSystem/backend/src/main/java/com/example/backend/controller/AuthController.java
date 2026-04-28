package com.example.backend.controller;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.security.AuthService;


/**
 * Controller for handling authentication-related endpoints, such as user registration and login.
 * Provides endpoints for signing up new users and logging in existing users, returning appropriate response DTOs.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint for user registration. Accepts a SignupRequestDto containing the user's details,
     * and returns a SignUpResponseDto with the details of the created user.
     */
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponseDto> signup(@Valid @RequestBody SignupRequestDto dto) {
        return ResponseEntity.ok(authService.signup(dto));
    }

    /**
     * Endpoint for user login. Accepts a LoginRequestDto containing the user's credentials,
     * and returns a LoginResponseDto with the authentication token.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}