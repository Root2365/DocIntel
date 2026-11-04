package com.docintel.backend.Common;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Response<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> Response<T> success(String message, T data) {
        return new Response<>(
                true,
                message,
                data,
                LocalDateTime.now()
        );
    }

    public static <T> Response<T> success(String message) {
        return new Response<>(
                true,
                message,
                null,
                LocalDateTime.now()
        );
    }

    public static <T> Response<T> error(String message) {
        return new Response<>(
                false,
                message,
                null,
                LocalDateTime.now()
        );
    }

    public static <T> Response<T> error(String message, T data) {
        return new Response<>(
                false,
                message,
                data,
                LocalDateTime.now()
        );
    }
}
