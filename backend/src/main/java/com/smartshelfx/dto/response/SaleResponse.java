package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponse {
    private Long id;
    private String saleNumber;
    private Long userId;
    private String username;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDateTime saleDate;
    private BigDecimal subtotal;
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String notes;
    private List<SaleItemResponse> items;
    private LocalDateTime createdAt;
}