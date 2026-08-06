package com.smartshelfx.controller;

import com.smartshelfx.entity.User;
import com.smartshelfx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<User> getProfile() {
        User user = getCurrentUser();
        // Remove password hash for security
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<User> updateProfile(@RequestBody User updateRequest) {
        User user = getCurrentUser();
        user.setFullName(updateRequest.getFullName());
        user.setEmail(updateRequest.getEmail());
        user.setPhone(updateRequest.getPhone());
        
        User updated = userRepository.save(user);
        updated.setPasswordHash(null);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/change-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> request) {
        
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        User user = getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Current password is incorrect");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully");
        return ResponseEntity.ok(response);
    }
}