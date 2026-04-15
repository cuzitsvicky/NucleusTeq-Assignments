package com.example.SpringAdvanceAssignment.exception;

// Custom exception to indicate invalid status transitions in the Todo lifecycle, such as moving from COMPLETED back to IN_PROGRESS.
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
