package com.example.backend.dto.response;

/**
 * Data Transfer Object for login responses. Contains the authentication token and user details such as user ID,
 * username, email, and role. This DTO is used to return the necessary information to the client upon successful login.
 */
public class LoginResponseDto {
    
    private String token;
    private Long userId;
    private String username;
    private String email;
    private String role;

    public LoginResponseDto(String token, Long userId, String username, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
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
}
