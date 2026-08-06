package com.smartshelfx.repository;

import com.smartshelfx.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    Optional<Sale> findBySaleNumber(String saleNumber);

    // Sales by date range
    @Query("SELECT s FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    List<Sale> findSalesBetween(@Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate);

    // Sales by user (with pagination)
    @Query("SELECT s FROM Sale s WHERE s.user.id = :userId")
    Page<Sale> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // Sales by user (without pagination - for counting)
    @Query("SELECT s FROM Sale s WHERE s.user.id = :userId")
    List<Sale> findByUserId(@Param("userId") Long userId);

    // Total revenue for date range
    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenue(@Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);

    // Daily sales summary
    @Query("SELECT DATE(s.saleDate) as saleDate, COUNT(s.id) as saleCount, SUM(s.totalAmount) as totalAmount " +
            "FROM Sale s WHERE s.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(s.saleDate) ORDER BY DATE(s.saleDate)")
    List<Object[]> getDailySalesSummary(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    // Top selling products
    @Query("SELECT si.product.id, si.product.name, SUM(si.quantity) as totalQuantity, SUM(si.totalPrice) as totalRevenue " +
            "FROM SaleItem si WHERE si.sale.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY si.product.id, si.product.name ORDER BY totalQuantity DESC")
    List<Object[]> getTopSellingProducts(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
}