package com.example.SpringAndRestAssignment.exception;

// ConfirmationRequiredException class
// This class defines a custom exception to be thrown when an operation requires confirmation before proceeding
public class ConfirmationRequiredException extends RuntimeException {
    public ConfirmationRequiredException(String message) {
        super(message);
    }
}
