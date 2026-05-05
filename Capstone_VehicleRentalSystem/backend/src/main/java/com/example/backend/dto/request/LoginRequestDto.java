package com.example.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for login requests. Contains the user's email and password, which are required for authentication.
 * The email field is validated to ensure it is in a proper email format, and both fields are required to be non-blank.
 */
public class LoginRequestDto {

   @Email(message = "Email format is invalid")
    @NotBlank(message = "Email is required")
    private String email;           
 
    @NotBlank(message = "Password is required")
    private String password;
 
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
}
