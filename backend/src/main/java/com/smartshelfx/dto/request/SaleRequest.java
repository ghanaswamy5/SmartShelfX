package com.smartshelfx.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleRequest {
    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must be less than 100 characters")
    private String customerName;

    @Size(max = 100, message = "Customer email must be less than 100 characters")
    private String customerEmail;

    @Size(max = 20, message = "Customer phone must be less than 20 characters")
    private String customerPhone;

    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Size(max = 50, message = "Payment method must be less than 50 characters")
    private String paymentMethod = "CASH";

    private String notes;

    @NotNull(message = "Sale items are required")
    @Valid
    private List<SaleItemRequest> items = new ArrayList<>();
}