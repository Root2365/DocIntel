package com.docintel.backend.Service;

import com.docintel.backend.Common.Exception.BadRequestException;
import com.docintel.backend.Config.JwtService;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.UserRepository;
import com.docintel.backend.Dto.AuthRequest;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${docintel.admin.bootstrap-email:test@gmail.com}")
    private String bootstrapAdminEmail;

    /**
     * Register a new user
     */
    public String register(AuthRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Name is required.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Email is already registered."
            );
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(isBootstrapAdminEmail(request.getEmail()) ? Role.ADMIN : Role.USER)
                .build();

        userRepository.save(user);

        return jwtService.generateToken(user);
    }

    /**
     * Login existing user
     */
    public String login(AuthRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException(
                                "Invalid email or password."
                        ));

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatches) {
            throw new BadRequestException(
                    "Invalid email or password."
            );
        }

        if (isBootstrapAdminEmail(user.getEmail())
                && user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            userRepository.save(user);
        }

        return jwtService.generateToken(user);
    }

    private boolean isBootstrapAdminEmail(String email) {
        return email != null && email.equalsIgnoreCase(bootstrapAdminEmail);
    }

}
