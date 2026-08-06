package com.smartshelfx.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KPISummary {
    private Long totalProducts;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Long expiringCount;
    private Long totalSales;
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private Long todaySales;
}