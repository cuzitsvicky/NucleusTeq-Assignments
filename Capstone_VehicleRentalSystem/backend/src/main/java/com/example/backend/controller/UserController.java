package com.example.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.service.UserService;

/**
 * Controller for user profile endpoints.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** GET /api/users/me — return the authenticated user's profile. */
    @GetMapping("/me")
    public ResponseEntity<SignUpResponseDto> getCurrentUser(Authentication authentication) {
        log.info("GET /api/users/me — user: {}", authentication.getName());
        SignUpResponseDto response = userService.getCurrentUser(authentication.getName());
        log.debug("Profile returned for userId: {}", response.getUserId());
        return ResponseEntity.ok(response);
    }
}