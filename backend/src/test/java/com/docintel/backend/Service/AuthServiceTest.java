package com.docintel.backend.Service;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.docintel.backend.Config.JwtService;
import com.docintel.backend.Dto.AuthRequest;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        ReflectionTestUtils.setField(
                authService,
                "bootstrapAdminEmail",
                "test@gmail.com"
        );
        when(jwtService.generateToken(any(User.class))).thenReturn("token");
    }

    @Test
    void registersBootstrapEmailAsAdministrator() {
        AuthRequest request = new AuthRequest();
        request.setName("Test Admin");
        request.setEmail("TEST@gmail.com");
        request.setPassword("password");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded");

        assertEquals("token", authService.register(request));

        verify(userRepository).save(any(User.class));
        org.mockito.ArgumentCaptor<User> userCaptor =
                org.mockito.ArgumentCaptor.forClass(User.class);
        verify(jwtService).generateToken(userCaptor.capture());
        assertEquals(Role.ADMIN, userCaptor.getValue().getRole());
    }

    @Test
    void promotesExistingBootstrapAccountAtSignIn() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("password");
        User user = User.builder()
                .id(1L)
                .name("Test Admin")
                .email("test@gmail.com")
                .password("encoded")
                .role(Role.USER)
                .build();
        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .thenReturn(true);
        when(userRepository.save(user)).thenReturn(user);

        assertEquals("token", authService.login(request));

        assertEquals(Role.ADMIN, user.getRole());
        verify(userRepository).save(user);
        verify(jwtService).generateToken(user);
    }
}
