package com.GatherPoint.backend.Admin;

import com.GatherPoint.backend.Constants.Role;
import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminComponent implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeAdminUsers();
    }

    private void initializeAdminUsers() {
        List<String> adminEmails = List.of(
                "anshikarai0404@gmail.com",
                "atulupadhyay192@gmail.com",
                "patelkhushi1532007@gmail.com",
                "satyamkumarsinghjaisidih@gmail.com"
        );

        for (String email : adminEmails) {
            if (userRepo.findByEmail(email).isEmpty()) {
                User adminUser = new User();
                adminUser.setName(email.substring(0, email.indexOf('@')));
                adminUser.setEmail(email);
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole(Role.ADMIN);
                adminUser.setActive(true);
                userRepo.save(adminUser);
            }
        }
    }
}
