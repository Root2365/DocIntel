package com.docintel.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docintel.backend.Common.Response;
import com.docintel.backend.Dto.AdminUserResponse;
import com.docintel.backend.Dto.UpdateUserRoleRequest;
import com.docintel.backend.Service.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Response<List<AdminUserResponse>>> getUsers(
            Authentication authentication
    ) {
        return ResponseEntity.ok(Response.success(
                "Users retrieved successfully",
                adminUserService.getUsers(authentication.getName())
        ));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<Response<AdminUserResponse>> updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(Response.success(
                "User role updated successfully",
                adminUserService.updateRole(
                        userId,
                        request.role(),
                        authentication.getName()
                )
        ));
    }
}
