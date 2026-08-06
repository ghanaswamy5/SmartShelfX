package com.smartshelfx.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Movement type is required")
    @Size(max = 20, message = "Movement type must be less than 20 characters")
    private String movementType; // 'IN', 'OUT', 'TRANSFER', 'DAMAGE'

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    @Size(max = 100, message = "Reference ID must be less than 100 characters")
    private String referenceId;

    @Size(max = 50, message = "Reference type must be less than 50 characters")
    private String referenceType;

    private String notes;
}