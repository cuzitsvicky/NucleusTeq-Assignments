package com.example.SpringAndRestAssignment.exception;


// BadRequestException class
// This class represents a custom exception for handling bad requests in the application
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}