package com.smartshelfx.controller;

import com.smartshelfx.dto.request.ProductRequest;
import com.smartshelfx.dto.response.ProductResponse;
import com.smartshelfx.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        ProductResponse response = productService.getProductBySku(sku);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ProductResponse> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<ProductResponse> products = productService.searchProducts(keyword, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        List<ProductResponse> products = productService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        List<ProductResponse> products = productService.getOutOfStockProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<ProductResponse>> getExpiringProducts(
            @RequestParam(defaultValue = "30") int days) {
        List<ProductResponse> products = productService.getExpiringProducts(days);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductResponse> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<ProductResponse>> getProductsBySupplier(@PathVariable Long supplierId) {
        List<ProductResponse> products = productService.getProductsBySupplier(supplierId);
        return ResponseEntity.ok(products);
    }
}