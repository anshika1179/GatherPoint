package com.GatherPoint.backend.Admin;

import com.GatherPoint.backend.Constants.Role;
import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminComponent implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.emails:anshika1179@gmail.com}")
    private String adminEmailsRaw;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        initializeAdminUsers();
    }

    private void initializeAdminUsers() {
        List<String> adminEmails = List.of(adminEmailsRaw.split(","));

        for (String email : adminEmails) {
            email = email.trim();
            java.util.Optional<User> existing = userRepo.findByEmail(email);
            if (existing.isEmpty()) {
                User adminUser = new User();
                adminUser.setName(email.substring(0, email.indexOf('@')));
                adminUser.setEmail(email);
                adminUser.setPassword(passwordEncoder.encode(adminPassword));
                adminUser.setRole(Role.ADMIN);
                adminUser.setActive(true);
                userRepo.save(adminUser);
            } else {
                User user = existing.get();
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepo.save(user);
                }
            }
        }
    }
}
