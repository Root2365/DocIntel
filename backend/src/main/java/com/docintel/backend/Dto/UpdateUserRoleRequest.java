package com.docintel.backend.Dto;

import com.docintel.backend.Entity.Role;

import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull Role role
) {
}
