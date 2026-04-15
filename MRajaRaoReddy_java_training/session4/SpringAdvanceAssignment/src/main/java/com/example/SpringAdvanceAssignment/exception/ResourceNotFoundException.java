package com.example.SpringAdvanceAssignment.exception;

// Custom exception to indicate that a requested resource (e.g., a Todo item) was not found in the system, typically resulting in a 404 Not Found response.
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
