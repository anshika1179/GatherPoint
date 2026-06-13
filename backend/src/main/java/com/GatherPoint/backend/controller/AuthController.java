package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import com.GatherPoint.backend.config.JwtUtil;
import com.GatherPoint.backend.dto.AuthResponse;
import com.GatherPoint.backend.dto.LoginRequest;
import com.GatherPoint.backend.dto.RefreshTokenRequest;
import com.GatherPoint.backend.dto.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

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
}
