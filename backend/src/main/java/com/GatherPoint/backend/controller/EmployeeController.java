package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Constants.Role;
import com.GatherPoint.backend.Mapper.EmployeeMapper;
import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import com.GatherPoint.backend.dto.Response.EmployeeResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@AllArgsConstructor
public class EmployeeController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<EmployeeResponse> getAllEmployees() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE
                        || u.getRole() == Role.KITCHEN_STAFF
                        || u.getRole() == Role.ADMIN)
                .map(EmployeeMapper::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> addEmployee(@RequestBody User employee) {
        if (userRepo.findByEmail(employee.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setActive(true);
        if (!employee.isAllowOfflineSelling() && employee.getRole() != Role.ADMIN) {
            employee.setAllowOfflineSelling(true);
        }
        User saved = userRepo.save(employee);
        return ResponseEntity.ok(EmployeeMapper.toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody User updates) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User user = opt.get();
        if (updates.getName() != null) user.setName(updates.getName());
        if (updates.getEmail() != null) user.setEmail(updates.getEmail());
        if (updates.getRole() != null) user.setRole(updates.getRole());
        user.setActive(updates.isActive());
        user.setAllowOfflineSelling(updates.isAllowOfflineSelling());

        User saved = userRepo.save(user);
        return ResponseEntity.ok(EmployeeMapper.toResponse(saved));
    }

    @PatchMapping("/{id}/offline-selling")
    public ResponseEntity<?> toggleOfflineSelling(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User user = opt.get();
        Boolean enabled = body.get("enabled");
        user.setAllowOfflineSelling(enabled != null ? enabled : !user.isAllowOfflineSelling());
        User saved = userRepo.save(user);
        return ResponseEntity.ok(EmployeeMapper.toResponse(saved));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        String newPassword = request.get("password");
        if (newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Password cannot be empty!");
        }

        User user = opt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        return ResponseEntity.ok("Password changed successfully!");
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<?> archiveEmployee(@PathVariable Long id) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User user = opt.get();
        user.setActive(!user.isActive());
        User saved = userRepo.save(user);

        return ResponseEntity.ok(EmployeeMapper.toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        userRepo.deleteById(id);
        return ResponseEntity.ok("Employee deleted successfully");
    }
}
