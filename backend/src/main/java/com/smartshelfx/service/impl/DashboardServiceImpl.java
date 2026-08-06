package com.smartshelfx.service.impl;

import com.smartshelfx.dto.response.*;
import com.smartshelfx.entity.Notification;
import com.smartshelfx.entity.Product;
import com.smartshelfx.repository.*;
import com.smartshelfx.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public DashboardResponse getDashboardData() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startOfWeek = LocalDate.now().minusDays(7).atStartOfDay();

        // Get KPIs
        List<Product> allProducts = productRepository.findAll();
        List<Product> lowStock = productRepository.findLowStockProducts();
        List<Product> outOfStock = productRepository.findOutOfStockProducts();
        List<Product> expiring = productRepository.findExpiringBefore(LocalDate.now().plusDays(30));

        BigDecimal totalRevenue = saleRepository.getTotalRevenue(
                LocalDateTime.of(2000, 1, 1, 0, 0), 
                LocalDateTime.now()
        );
        
        BigDecimal todayRevenue = saleRepository.getTotalRevenue(startOfDay, endOfDay);
        Long todaySales = (long) saleRepository.findSalesBetween(startOfDay, endOfDay).size();
        Long totalSales = (long) saleRepository.findAll().size();

        KPISummary kpiSummary = KPISummary.builder()
                .totalProducts((long) allProducts.size())
                .lowStockCount((long) lowStock.size())
                .outOfStockCount((long) outOfStock.size())
                .expiringCount((long) expiring.size())
                .totalSales(totalSales)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .todaySales(todaySales)
                .build();

        // Get revenue chart data (last 7 days)
        List<Object[]> dailySales = saleRepository.getDailySalesSummary(startOfWeek, LocalDateTime.now());
        List<DailyRevenue> revenueChart = dailySales.stream()
                .map(row -> DailyRevenue.builder()
                        .date(row[0] != null ? row[0].toString() : "")
                        .revenue(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO)
                        .salesCount(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        // Get alerts (top 10 unread notifications)
        List<Notification> notifications = notificationRepository.findAll()
                .stream()
                .filter(n -> !n.getIsRead())
                .limit(10)
                .collect(Collectors.toList());

        List<AlertResponse> alerts = notifications.stream()
                .map(n -> AlertResponse.builder()
                        .id(n.getId())
                        .type(n.getType())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .link(n.getLink())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Get low stock and expiring products
        List<ProductResponse> lowStockProducts = lowStock.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        List<ProductResponse> expiringProducts = expiring.stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        // Get recent sales
        List<SaleResponse> recentSales = saleRepository
                .findSalesBetween(LocalDateTime.now().minusDays(7), LocalDateTime.now())
                .stream()
                .limit(10)
                .map(this::mapToSaleResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .kpiSummary(kpiSummary)
                .revenueChart(revenueChart)
                .alerts(alerts)
                .lowStockProducts(lowStockProducts)
                .expiringProducts(expiringProducts)
                .recentSales(recentSales)
                .build();
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .isLowStock(product.isLowStock())
                .isOutOfStock(product.isOutOfStock())
                .isExpiringSoon(product.isExpiringSoon())
                .build();
    }

    private SaleResponse mapToSaleResponse(com.smartshelfx.entity.Sale sale) {
        return SaleResponse.builder()
                .id(sale.getId())
                .saleNumber(sale.getSaleNumber())
                .customerName(sale.getCustomerName())
                .totalAmount(sale.getTotalAmount())
                .saleDate(sale.getSaleDate())
                .build();
    }
}