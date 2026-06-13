package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.PosSession;
import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.PosSessionRepo;
import com.GatherPoint.backend.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/session")
public class SessionController {

    @Autowired
    private PosSessionRepo sessionRepo;

    @Autowired
    private UserRepo userRepo;

    private User getLoggedInUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        // Fallback/Safety (in case name string is set instead of object)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElse(null);
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveSession() {
        User user = getLoggedInUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");

        Optional<PosSession> activeOpt = sessionRepo.findByEmployeeIdAndClosedAtIsNull(user.getId());
        if (activeOpt.isPresent()) {
            return ResponseEntity.ok(activeOpt.get());
        }
        return ResponseEntity.ok(Map.of("active", false));
    }

    @PostMapping("/open")
    public ResponseEntity<?> openSession(@RequestBody Map<String, BigDecimal> requestBody) {
        User user = getLoggedInUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");

        // Check if there is already an open session
        Optional<PosSession> activeOpt = sessionRepo.findByEmployeeIdAndClosedAtIsNull(user.getId());
        if (activeOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("A POS session is already active!");
        }

        BigDecimal openingAmount = requestBody.getOrDefault("openingAmount", BigDecimal.ZERO);

        PosSession session = PosSession.builder()
                .openedAt(LocalDateTime.now())
                .openingAmount(openingAmount)
                .employee(user)
                .build();

        PosSession saved = sessionRepo.save(session);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/close")
    public ResponseEntity<?> closeSession(@RequestBody Map<String, BigDecimal> requestBody) {
        User user = getLoggedInUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");

        Optional<PosSession> activeOpt = sessionRepo.findByEmployeeIdAndClosedAtIsNull(user.getId());
        if (activeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No active session found to close!");
        }

        BigDecimal closingAmount = requestBody.getOrDefault("closingAmount", BigDecimal.ZERO);

        PosSession session = activeOpt.get();
        session.setClosedAt(LocalDateTime.now());
        session.setClosingAmount(closingAmount);

        PosSession saved = sessionRepo.save(session);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getSessionHistory() {
        User user = getLoggedInUser();
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");

        // Admins can see all sessions, Employees can see only theirs
        List<PosSession> sessions;
        if (user.getRole() == com.GatherPoint.backend.Constants.Role.ADMIN) {
            sessions = sessionRepo.findAll();
        } else {
            sessions = sessionRepo.findByEmployeeId(user.getId());
        }
        return ResponseEntity.ok(sessions);
    }
}
