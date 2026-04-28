package com.example.backend.service;

import org.springframework.stereotype.Service;

import com.example.backend.dto.response.SignUpResponseDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
  
    /* Retrieves a user by their email. Validates that the user exists and returns the User entity.
     * This method is used internally for various operations that require fetching a user by email.
     */
    public User findEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /* Retrieves a user by their ID. Validates that the user exists and returns the User entity.
     * This method is used internally for various operations that require fetching a user by ID.
     */
    public User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /* Retrieves the current authenticated user's profile information. Validates that the user exists and returns their details as a DTO.
     * This method is used for displaying the user's profile information on the frontend.
     */
    public SignUpResponseDto getCurrentUser(String email) {
        User user = findEntityByEmail(email);
        return new SignUpResponseDto(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name(),
                user.getCreatedAt());
    }
}
