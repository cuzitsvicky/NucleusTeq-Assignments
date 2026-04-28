package com.example.backend.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.service.UserService;

/**
 * Controller for handling user-related endpoints, such as retrieving the current user's profile information.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint for retrieving the current authenticated user's profile information.
     * Returns a SignUpResponseDto with the user's details.
     */
    @GetMapping("/me")
    public ResponseEntity<SignUpResponseDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }
}

