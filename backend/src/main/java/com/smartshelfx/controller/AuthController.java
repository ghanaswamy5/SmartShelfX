package com.smartshelfx.controller;

import com.smartshelfx.dto.request.LoginRequest;
import com.smartshelfx.dto.request.RegisterRequest;
import com.smartshelfx.dto.response.AuthResponse;
import com.smartshelfx.entity.Role;
import com.smartshelfx.entity.User;
import com.smartshelfx.repository.RoleRepository;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String token = jwtUtil.generateToken(request.getUsername(), user.getRole().getName());
            
            AuthResponse response = new AuthResponse(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().getName(),
                user.getId()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Check if username exists
            if (userRepository.existsByUsername(request.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username is already taken");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Check if email exists
            if (userRepository.existsByEmail(request.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email is already registered");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Get default role (EMPLOYEE)
            Role employeeRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
            
            // Create user
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFullName(request.getFullName());
            user.setPhone(request.getPhone());
            user.setRole(employeeRole);
            user.setIsActive(true);
            
            User savedUser = userRepository.save(user);
            
            // Generate token
            String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole().getName());
            
            AuthResponse response = new AuthResponse(
                token,
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().getName(),
                savedUser.getId()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}