package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.User;
import com.GatherPoint.backend.Repo.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<User> getAllEmployees() {
        return userRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addEmployee(@RequestBody User employee) {
        if (userRepo.findByEmail(employee.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setActive(true);
        User saved = userRepo.save(employee);
        return ResponseEntity.ok(saved);
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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody User employeeDetails) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User user = opt.get();
        if (!user.getEmail().equalsIgnoreCase(employeeDetails.getEmail())) {
            if (userRepo.findByEmail(employeeDetails.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists!");
            }
        }

        user.setName(employeeDetails.getName());
        user.setEmail(employeeDetails.getEmail());
        user.setRole(employeeDetails.getRole());

        User saved = userRepo.save(user);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<?> archiveEmployee(@PathVariable Long id) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User user = opt.get();
        user.setActive(!user.isActive()); // toggle active status (archive/unarchive)
        User saved = userRepo.save(user);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();
        userRepo.deleteById(id);
        return ResponseEntity.ok("Employee deleted successfully");
    }
}
