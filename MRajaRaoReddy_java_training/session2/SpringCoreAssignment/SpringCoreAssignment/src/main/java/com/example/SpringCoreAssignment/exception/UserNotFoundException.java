package com.example.SpringCoreAssignment.exception;


public class UserNotFoundException extends RuntimeException {

    // constructor to initialize the exception message
    public UserNotFoundException(String message) {
        super(message);
    }
}