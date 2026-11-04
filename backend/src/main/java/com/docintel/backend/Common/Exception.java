package com.docintel.backend.Common;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

public class Exception {

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    public static class BadRequestException extends RuntimeException {
        public BadRequestException(String message) {
            super(message);
        }
    }

    public record ErrorResponse(
            boolean success,
            String message,
            LocalDateTime timestamp,
            Map<String, String> errors
    ) {}

    @RestControllerAdvice
    public static class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFound(
                ResourceNotFoundException ex) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(
                            false,
                            ex.getMessage(),
                            LocalDateTime.now(),
                            null
                    ));
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ErrorResponse> handleBadRequest(
                BadRequestException ex) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(
                            false,
                            ex.getMessage(),
                            LocalDateTime.now(),
                            null
                    ));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidation(
                MethodArgumentNotValidException ex) {

            Map<String, String> errors = new HashMap<>();

            ex.getBindingResult()
                    .getAllErrors()
                    .forEach(error -> {
                        String field =
                                ((FieldError) error).getField();

                        String message =
                                error.getDefaultMessage();

                        errors.put(field, message);
                    });

            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(
                            false,
                            "Validation failed",
                            LocalDateTime.now(),
                            errors
                    ));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDenied(
                AccessDeniedException ex) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(
                            false,
                            "You do not have permission to access this resource",
                            LocalDateTime.now(),
                            null
                    ));
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleInvalidPassword(
                IllegalArgumentException ex) {

            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(
                            false,
                            ex.getMessage(),
                            LocalDateTime.now(),
                            null
                    ));
        }

        @ExceptionHandler(java.lang.Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                java.lang.Exception ex) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            false,
                            "Something went wrong. Please try again later.",
                            LocalDateTime.now(),
                            null
                    ));
        }
    }
}