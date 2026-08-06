package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String movementType;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String referenceId;
    private String referenceType;
    private String notes;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
}