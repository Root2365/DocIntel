package com.docintel.backend.Service;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import com.docintel.backend.Common.Exception.BadRequestException;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminUserServiceTest {

    private UserRepository userRepository;
    private AdminUserService adminUserService;
    private User administrator;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        adminUserService = new AdminUserService(userRepository);
        ReflectionTestUtils.setField(
                adminUserService,
                "bootstrapAdminEmail",
                "test@gmail.com"
        );

        administrator = User.builder()
                .id(1L)
                .name("Administrator")
                .email("admin@example.com")
                .role(Role.ADMIN)
                .build();
        when(userRepository.findByEmailIgnoreCase("admin@example.com"))
                .thenReturn(Optional.of(administrator));
    }

    @Test
    void promotesUserWhenCurrentAccountIsAdministrator() {
        User user = User.builder()
                .id(2L)
                .name("User")
                .email("user@example.com")
                .role(Role.USER)
                .build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        var updated = adminUserService.updateRole(2L, Role.ADMIN, administrator.getEmail());

        assertEquals(Role.ADMIN, updated.role());
        verify(userRepository).save(user);
    }

    @Test
    void rejectsChangingOwnRole() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(administrator));

        assertThrows(
                BadRequestException.class,
                () -> adminUserService.updateRole(1L, Role.USER, administrator.getEmail())
        );

        verify(userRepository, never()).save(administrator);
    }

    @Test
    void protectsBootstrapAdministratorFromDemotion() {
        User bootstrapAdmin = User.builder()
                .id(3L)
                .name("Bootstrap")
                .email("test@gmail.com")
                .role(Role.ADMIN)
                .build();
        when(userRepository.findById(3L)).thenReturn(Optional.of(bootstrapAdmin));

        assertThrows(
                BadRequestException.class,
                () -> adminUserService.updateRole(3L, Role.USER, administrator.getEmail())
        );

        verify(userRepository, never()).save(bootstrapAdmin);
    }

    @Test
    void checksCurrentDatabaseRoleRatherThanRelyingOnlyOnJwtRole() {
        User demotedUser = User.builder()
                .id(4L)
                .email("admin@example.com")
                .role(Role.USER)
                .build();
        when(userRepository.findByEmailIgnoreCase("admin@example.com"))
                .thenReturn(Optional.of(demotedUser));

        assertThrows(
                AccessDeniedException.class,
                () -> adminUserService.getUsers("admin@example.com")
        );
    }
}
