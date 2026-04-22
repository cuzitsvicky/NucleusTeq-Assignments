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

    public User findEntityByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public SignUpResponseDto getCurrentUser(String username) {
        User user = findEntityByUsername(username);
        return new SignUpResponseDto(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name(),
                user.getCreatedAt());
    }
}
