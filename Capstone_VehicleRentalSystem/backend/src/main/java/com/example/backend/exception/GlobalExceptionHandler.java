package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.backend.dto.response.ErrorResponse;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application. This class uses @RestControllerAdvice to intercept exceptions thrown
 * by any controller and return a consistent error response format. It handles custom exceptions such as
 * ResourceNotFoundException, DuplicateResourceException, BadRequestException, UnauthorizedException, and ForbiddenException,
 * as well as Spring Security's AccessDeniedException and validation errors from @Valid annotated request bodies.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle custom ResourceNotFoundException for cases like missing user, vehicle, or reservation
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
    }

    /**
     * Handle custom DuplicateResourceException for cases like existing username or email
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        return build(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), null);
    }

    /**
     * Handle custom BadRequestException for invalid inputs or business rule violations
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), null);
    }

    /**
     * Handle both custom UnauthorizedException and Spring Security's AuthenticationException
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), null);
    }

    /**
     * Handle both custom ForbiddenException and Spring Security's AccessDeniedException
     */
    @ExceptionHandler({ ForbiddenException.class, AccessDeniedException.class })
    public ResponseEntity<ErrorResponse> handleForbidden(Exception ex) {
        return build(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), null);
    }

    /**
     * Handle validation errors from @Valid annotated request bodies
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> validationMap = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> validationMap.put(error.getField(), error.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "Validation Error", "Invalid request data", validationMap);
    }

    /**
     * Catch-all for any other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), null);
    }

    /**
     * Helper method to build consistent error responses
     */
    private ResponseEntity<ErrorResponse> build(HttpStatus status, String error, String message,
            Map<String, String> validation) {
        return new ResponseEntity<>(new ErrorResponse(status.value(), error, message, validation), status);
    }
}
