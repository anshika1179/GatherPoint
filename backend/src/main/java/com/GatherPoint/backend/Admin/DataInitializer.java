package com.GatherPoint.backend.Admin;

import com.GatherPoint.backend.Constants.Role;
import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    private static final List<String> ADMIN_EMAILS = List.of(
            "anshikarai0404@gmail.com",
            "atulupadhyay192@gmail.com",
            "patelkhushi1532007@gmail.com",
            "satyamkumarsinghjaisidih@gmail.com"
    );

    public DataInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        for (String email : ADMIN_EMAILS) {
            if (userRepo.findByEmail(email).isEmpty()) {
                User admin = User.builder()
                        .name(email.substring(0, email.indexOf('@')))
                        .email(email)
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .active(true)
                        .build();
                userRepo.save(admin);
            }
        }
    }
}
