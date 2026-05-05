package com.example.backend.exception;

/**
 * Custom exception class for handling resource not found errors. This exception is thrown when a requested resource
 * cannot be found in the system, such as a user, vehicle, or rental that does not exist. It extends RuntimeException,
 * allowing it to be used in various parts of the application where resource not found scenarios may occur.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
