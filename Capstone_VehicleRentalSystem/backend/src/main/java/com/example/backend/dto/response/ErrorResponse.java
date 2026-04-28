package com.example.backend.dto.response;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Data Transfer Object for error responses. Contains details about an error that occurred during API processing,
 * including the timestamp of the error, HTTP status code, error message, and any validation errors if applicable.
 * This DTO is used to return structured error information in API responses when exceptions are thrown.
 */
public class ErrorResponse {

    private LocalDateTime timestamp;

    private int status;

    private String error;

    private String message;
    
    private Map<String, String> validationErrors;

    public ErrorResponse(int status, String error, String message, Map<String, String> validationErrors) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.validationErrors = validationErrors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }
}
