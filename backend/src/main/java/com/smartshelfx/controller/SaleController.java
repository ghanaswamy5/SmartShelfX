package com.smartshelfx.controller;

import com.smartshelfx.dto.request.SaleRequest;
import com.smartshelfx.dto.response.SaleResponse;
import com.smartshelfx.entity.User;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SaleResponse response = saleService.createSale(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long id) {
        SaleResponse response = saleService.getSaleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{saleNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SaleResponse> getSaleByNumber(@PathVariable String saleNumber) {
        SaleResponse response = saleService.getSaleByNumber(saleNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Page<SaleResponse>> getAllSales(
            @PageableDefault(size = 20, sort = "saleDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SaleResponse> sales = saleService.getAllSales(pageable);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<SaleResponse>> getSalesByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "saleDate", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<SaleResponse> sales = saleService.getSalesByUser(userId, pageable);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<SaleResponse>> getSalesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        List<SaleResponse> sales = saleService.getSalesByDateRange(startDate, endDate);
        return ResponseEntity.ok(sales);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SaleResponse> cancelSale(@PathVariable Long id) {
        SaleResponse response = saleService.cancelSale(id);
        return ResponseEntity.ok(response);
    }
}