package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import com.GatherPoint.backend.Security.JwtUtil;
import com.GatherPoint.backend.dto.Request.ClerkLoginRequest;
import com.GatherPoint.backend.dto.Request.LoginRequest;
import com.GatherPoint.backend.dto.Request.RefreshTokenRequest;
import com.GatherPoint.backend.dto.Request.SignupRequest;
import com.GatherPoint.backend.dto.Response.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already taken!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : com.GatherPoint.backend.Constants.Role.EMPLOYEE)
                .active(true)
                .build();

        User savedUser = userRepo.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.isActive()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password!");
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User account is inactive!");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        ));
    }

    @PostMapping("/clerk-login")
    public ResponseEntity<?> clerkLogin(@RequestBody ClerkLoginRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());
        User user;
        
        com.GatherPoint.backend.Constants.Role requestedRole = com.GatherPoint.backend.Constants.Role.EMPLOYEE;
        if (request.getRole() != null) {
            try {
                requestedRole = com.GatherPoint.backend.Constants.Role.valueOf(request.getRole());
            } catch (IllegalArgumentException e) {
                // Keep default EMPLOYEE
            }
        }

        if (userOpt.isEmpty()) {
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(requestedRole)
                    .active(true)
                    .build();
            user = userRepo.save(user);
        } else {
            user = userOpt.get();
            // Update role to match requested role for testing/demo purposes
            if (request.getRole() != null && user.getRole() != requestedRole) {
                user.setRole(requestedRole);
                user = userRepo.save(user);
            }
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        try {
            String email = jwtUtil.extractUsername(request.getToken());
            Optional<User> userOpt = userRepo.findByEmail(email);

            if (userOpt.isPresent() && userOpt.get().isActive()) {
                String newToken = jwtUtil.generateToken(email);
                User user = userOpt.get();
                return ResponseEntity.ok(new AuthResponse(
                        newToken,
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.isActive()
                ));
            }
        } catch (Exception e) {
            // Token invalid or expired
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token!");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Successfully logged out!");
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return ResponseEntity.ok(authentication.getPrincipal());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
    }
}
