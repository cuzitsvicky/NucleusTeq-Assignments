package com.example.SpringAndRestAssignment.exception;

// UserNotFoundException class
// This class defines a custom exception to be thrown when a user is not found in the repository
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
