package com.example.backend.dto.response;
import java.time.LocalDateTime;

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
