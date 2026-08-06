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
public class DashboardResponse {
    private KPISummary kpiSummary;
    private List<DailyRevenue> revenueChart;
    private List<AlertResponse> alerts;
    private List<ProductResponse> lowStockProducts;
    private List<ProductResponse> expiringProducts;
    private List<SaleResponse> recentSales;
}