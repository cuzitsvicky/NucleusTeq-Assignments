package com.example.SpringCoreAssignment.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle UserNotFoundException
    @ExceptionHandler(UserNotFoundException.class)
    public String handleUserNotFound(UserNotFoundException ex) {
        return ex.getMessage();
    }

    // Handle DuplicateUserException
    @ExceptionHandler(DuplicateUserException.class)
    public String handleDuplicateUser(DuplicateUserException ex) {
        return ex.getMessage();
    }

    // Handle any other exceptions
    @ExceptionHandler(Exception.class)
    public String handleGeneralException(Exception ex) {
        return "Something went wrong: " + ex.getMessage();
    }

    // Handle validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {

        String error = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        return ResponseEntity.badRequest().body(error);
    }
}