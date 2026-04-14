package com.example.SpringAndRestAssignment.exception;


// ValidationException class
// This class defines a custom exception to be thrown when validation of user data fails
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
