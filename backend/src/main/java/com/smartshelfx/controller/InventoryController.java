package com.smartshelfx.controller;

import com.smartshelfx.dto.request.InventoryMovementRequest;
import com.smartshelfx.dto.response.InventoryMovementResponse;
import com.smartshelfx.entity.User;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    @PostMapping("/movement")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<InventoryMovementResponse> createMovement(
            @Valid @RequestBody InventoryMovementRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        InventoryMovementResponse response = inventoryService.createMovement(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/movements/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByProduct(@PathVariable Long productId) {
        List<InventoryMovementResponse> movements = inventoryService.getMovementsByProduct(productId);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/movements/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByType(@PathVariable String type) {
        List<InventoryMovementResponse> movements = inventoryService.getMovementsByType(type);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/movements/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
        LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
        List<InventoryMovementResponse> movements = inventoryService.getMovementsBetween(start, end);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/movements/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<InventoryMovementResponse> getMovementById(@PathVariable Long id) {
        InventoryMovementResponse response = inventoryService.getMovementById(id);
        return ResponseEntity.ok(response);
    }
}