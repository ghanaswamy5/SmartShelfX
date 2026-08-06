package com.smartshelfx.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must be less than 50 characters")
    private String sku;

    @Size(max = 50, message = "Barcode must be less than 50 characters")
    private String barcode;

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name must be less than 200 characters")
    private String name;

    private String description;

    private Long categoryId;

    private Long supplierId;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Cost price must be greater than 0")
    private BigDecimal costPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
    private BigDecimal sellingPrice;

    @NotNull(message = "Current stock is required")
    @Min(value = 0, message = "Current stock cannot be negative")
    private Integer currentStock;

    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;

    private Integer reorderQuantity;
    private Integer minStock;
    private Integer maxStock;

    @Size(max = 20, message = "Unit must be less than 20 characters")
    private String unit = "pcs";

    private LocalDate expiryDate;
    private Boolean isActive = true;
}