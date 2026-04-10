package com.example.SpringCoreAssignment.exception;

public class DuplicateUserException extends RuntimeException {

    // constructor to initialize the exception message
    public DuplicateUserException(String message) {
        super(message);
    }
}
