package com.example.backend.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.dto.response.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_returnsNotFoundResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleNotFound(new ResourceNotFoundException("Vehicle not found"));

        assertError(response, HttpStatus.NOT_FOUND, "Not Found", "Vehicle not found");
    }

    @Test
    void handleDuplicate_returnsConflictResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleDuplicate(new DuplicateResourceException("Email already exists"));

        assertError(response, HttpStatus.CONFLICT, "Conflict", "Email already exists");
    }

    @Test
    void handleBadRequest_returnsBadRequestResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleBadRequest(new BadRequestException("End date must be after start date"));

        assertError(response, HttpStatus.BAD_REQUEST, "Bad Request", "End date must be after start date");
    }

    @Test
    void handleUnauthorized_returnsUnauthorizedResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleUnauthorized(new UnauthorizedException("Invalid token"));

        assertError(response, HttpStatus.UNAUTHORIZED, "Unauthorized", "Invalid token");
    }

    @Test
    void handleForbidden_withCustomException_returnsForbiddenResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleForbidden(new ForbiddenException("Admin access required"));

        assertError(response, HttpStatus.FORBIDDEN, "Forbidden", "Admin access required");
    }

    @Test
    void handleForbidden_withSpringAccessDeniedException_returnsForbiddenResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleForbidden(new AccessDeniedException("Access denied"));

        assertError(response, HttpStatus.FORBIDDEN, "Forbidden", "Access denied");
    }

    @Test
    void handleValidation_returnsFieldValidationErrors() throws NoSuchMethodException {
        MethodParameter parameter = new MethodParameter(
                GlobalExceptionHandler.class.getDeclaredMethod("handleValidation", MethodArgumentNotValidException.class),
                0);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new SampleRequest(), "sampleRequest");
        bindingResult.addError(new FieldError("sampleRequest", "email", "must not be blank"));

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(parameter, bindingResult);
        ResponseEntity<ErrorResponse> response = handler.handleValidation(exception);

        assertError(response, HttpStatus.BAD_REQUEST, "Validation Error", "Invalid request data");
        assertThat(response.getBody().getValidationErrors())
                .containsEntry("email", "must not be blank");
    }

    @Test
    void handleGeneric_returnsInternalServerErrorResponse() {
        ResponseEntity<ErrorResponse> response =
                handler.handleGeneric(new RuntimeException("Unexpected failure"));

        assertError(response, HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "Unexpected failure");
    }

    private static void assertError(
            ResponseEntity<ErrorResponse> response,
            HttpStatus status,
            String error,
            String message) {
        assertThat(response.getStatusCode()).isEqualTo(status);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTimestamp()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(status.value());
        assertThat(response.getBody().getError()).isEqualTo(error);
        assertThat(response.getBody().getMessage()).isEqualTo(message);
    }

    private static class SampleRequest {
    }
}
