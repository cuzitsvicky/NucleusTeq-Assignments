package com.example.backend.dto.response;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for signup responses. Contains the user's ID, username, email, role, and account creation timestamp.
 * This DTO is used to return the necessary information to the client upon successful user registration.
 */
public class SignUpResponseDto {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    public SignUpResponseDto(Long userId, String username, String email, String role, LocalDateTime createdAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
