package com.example.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Retrieves a User entity by email. */
    public User findEntityByEmail(String email) {
        log.debug("Looking up user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new ResourceNotFoundException("User not found with email: " + email);
                });
    }

    /** Retrieves a User entity by ID. */
    public User findEntityById(Long id) {
        log.debug("Looking up user by id: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with id: {}", id);
                    return new ResourceNotFoundException("User not found with id: " + id);
                });
    }

    /** Returns the current authenticated user's profile as a DTO. */
    public SignUpResponseDto getCurrentUser(String email) {
        log.info("Fetching profile for user: {}", email);
        User user = findEntityByEmail(email);
        log.debug("Profile fetched — userId: {}, role: {}", user.getUserId(), user.getRole());
        return new SignUpResponseDto(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name(),
                user.getCreatedAt());
    }
}