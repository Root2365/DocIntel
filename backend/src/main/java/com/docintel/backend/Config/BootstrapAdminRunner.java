package com.docintel.backend.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.docintel.backend.Entity.Role;
import com.docintel.backend.Repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BootstrapAdminRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    @Value("${docintel.admin.bootstrap-email:test@gmail.com}")
    private String bootstrapAdminEmail;

    @Override
    public void run(String... args) {
        userRepository.findByEmailIgnoreCase(bootstrapAdminEmail)
                .ifPresentOrElse(user -> {
                    if (user.getRole() != Role.ADMIN) {
                        user.setRole(Role.ADMIN);
                        userRepository.save(user);
                        log.info("Granted bootstrap administrator role to {}", bootstrapAdminEmail);
                    }
                }, () -> log.warn(
                        "Bootstrap administrator {} is not registered yet; it will receive admin access when the account is registered",
                        bootstrapAdminEmail
                ));
    }
}
