package com.example.backend.exception;

/**
 * Custom exception class for handling bad request errors. This exception is thrown when the client sends a request
 * that is invalid or cannot be processed by the server. It extends RuntimeException, allowing it to be used
 * in various parts of the application where bad request scenarios may occur.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
