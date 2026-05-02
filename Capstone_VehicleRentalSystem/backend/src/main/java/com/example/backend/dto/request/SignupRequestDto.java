package com.example.backend.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for signup requests. Contains the user's username, email, password, and role,
 * which are required for user registration. The email field is validated to ensure it is in a proper email format,
 * the password must be at least 6 characters long, and all fields are required to be non-blank.
 */
public class SignupRequestDto {


    @NotBlank(message = "Username is required")
    private String username;


    @Email(message = "Email format is invalid")
    @NotBlank(message = "Email is required")
    private String email;


    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    private String role;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
