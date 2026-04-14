package com.example.SpringAndRestAssignment.exception;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// GlobalExceptionHandler class
// This class handles exceptions globally across the application and provides appropriate responses
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle BadRequestException and return a 400 Bad Request response with the exception message
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    // Handle ValidationException and return a 400 Bad Request response with the exception message
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<String> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
    
    // Handle UserNotFoundException and return a 404 Not Found response with the exception message
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    // Handle ConfirmationRequiredException and return a 400 Bad Request response with the exception message
    @ExceptionHandler(ConfirmationRequiredException.class)
    public ResponseEntity<String> handleConfirmation(ConfirmationRequiredException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    // Handle any other exceptions and return a 500 Internal Server Error response with a generic message
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneric(Exception ex) {
        return ResponseEntity.status(500).body("Something went wrong");
    }
}
