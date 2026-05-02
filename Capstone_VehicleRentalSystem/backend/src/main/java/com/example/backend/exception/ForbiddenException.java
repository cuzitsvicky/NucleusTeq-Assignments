package com.example.backend.exception;

/**
 * Custom exception class for handling forbidden access errors. This exception is thrown when a user attempts
 * to access a resource or perform an action that they do not have permission for. It extends RuntimeException,
 * allowing it to be used in various parts of the application where forbidden access scenarios may occur.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}

