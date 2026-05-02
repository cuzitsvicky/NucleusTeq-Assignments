package com.example.backend.exception;

/**
 * Custom exception class for handling unauthorized access errors. This exception is thrown when a user attempts
 * to access a resource or perform an action that requires authentication, but they are not authenticated or
 * their authentication token is invalid. It extends RuntimeException, allowing it to be used in various parts
 * of the application where unauthorized access scenarios may occur.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
