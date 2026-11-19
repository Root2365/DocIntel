package com.docintel.backend.Dto;

import java.time.LocalDateTime;

import com.docintel.backend.Entity.Role;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        Role role,
        LocalDateTime createdAt,
        boolean protectedAdmin
) {
}
