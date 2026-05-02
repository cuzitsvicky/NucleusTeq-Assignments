package com.example.backend.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.LoginRequestDto;
import com.example.backend.dto.request.SignupRequestDto;
import com.example.backend.dto.response.LoginResponseDto;
import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.security.AuthService;

/**
 * Controller for authentication endpoints: signup and login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/signup — register a new user. */
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponseDto> signup(@Valid @RequestBody SignupRequestDto dto) {
        log.info("POST /api/auth/signup — email: {}", dto.getEmail());
        SignUpResponseDto response = authService.signup(dto);
        log.info("Signup successful — userId: {}", response.getUserId());
        return ResponseEntity.ok(response);
    }

    /** POST /api/auth/login — authenticate and return a JWT. */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        log.info("POST /api/auth/login — email: {}", dto.getEmail());
        LoginResponseDto response = authService.login(dto);
        log.info("Login successful — userId: {}, role: {}", response.getUserId(), response.getRole());
        return ResponseEntity.ok(response);
    }
}