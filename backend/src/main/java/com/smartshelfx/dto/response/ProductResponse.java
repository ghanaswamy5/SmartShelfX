package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String sku;
    private String barcode;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer reorderQuantity;
    private Integer minStock;
    private Integer maxStock;
    private String unit;
    private LocalDate expiryDate;
    private Boolean isActive;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private Boolean isExpiringSoon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}