package com.docintel.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docintel.backend.Common.Exception.BadRequestException;
import com.docintel.backend.Common.Exception.ResourceNotFoundException;
import com.docintel.backend.Dto.AdminUserResponse;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Value("${docintel.admin.bootstrap-email:test@gmail.com}")
    private String bootstrapAdminEmail;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(String actingEmail) {
        requireCurrentAdmin(actingEmail);

        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse updateRole(
            Long userId,
            Role role,
            String actingEmail
    ) {
        requireCurrentAdmin(actingEmail);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (user.getEmail().equalsIgnoreCase(actingEmail)) {
            throw new BadRequestException("You cannot change your own role.");
        }

        if (isBootstrapAdmin(user.getEmail()) && role != Role.ADMIN) {
            throw new BadRequestException("The bootstrap administrator cannot be demoted.");
        }

        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    private void requireCurrentAdmin(String email) {
        User actingUser = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AccessDeniedException("Administrator access required."));

        if (actingUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Administrator access required.");
        }
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                isBootstrapAdmin(user.getEmail())
        );
    }

    private boolean isBootstrapAdmin(String email) {
        return email.equalsIgnoreCase(bootstrapAdminEmail);
    }
}
