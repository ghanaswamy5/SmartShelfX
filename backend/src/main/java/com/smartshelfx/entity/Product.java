package com.smartshelfx.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Size(max = 50)
    @Column(length = 50)
    private String barcode;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @NotNull
    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;

    @NotNull
    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @NotNull
    @Min(0)
    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;

    @NotNull
    @Min(0)
    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 10;

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity = 50;

    @Column(name = "min_stock")
    private Integer minStock = 5;

    @Column(name = "max_stock")
    private Integer maxStock = 500;

    @Size(max = 20)
    @Column(length = 20)
    private String unit = "pcs";

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SaleItem> saleItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InventoryMovement> inventoryMovements = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper method to check if product is low stock
    public boolean isLowStock() {
        return currentStock <= reorderLevel;
    }

    // Helper method to check if product is out of stock
    public boolean isOutOfStock() {
        return currentStock <= 0;
    }

    // Helper method to check if product is expiring soon (within 30 days)
    public boolean isExpiringSoon() {
        if (expiryDate == null) return false;
        return LocalDate.now().plusDays(30).isAfter(expiryDate);
    }
}