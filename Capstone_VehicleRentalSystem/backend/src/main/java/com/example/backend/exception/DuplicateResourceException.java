package com.example.backend.exception;

/**
 * Custom exception class for handling duplicate resource errors. This exception is thrown when an attempt is made
 * to create a resource that already exists in the system, such as a user with an existing email or username.
 * It extends RuntimeException, allowing it to be used in various parts of the application where duplicate resource
 * scenarios may occur.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

