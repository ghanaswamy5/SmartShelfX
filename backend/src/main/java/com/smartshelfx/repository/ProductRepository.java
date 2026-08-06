package com.smartshelfx.repository;

import com.smartshelfx.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    boolean existsBySku(String sku);

    // Low stock products (current stock <= reorder level)
    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel AND p.isActive = true")
    List<Product> findLowStockProducts();

    // Out of stock products
    @Query("SELECT p FROM Product p WHERE p.currentStock = 0 AND p.isActive = true")
    List<Product> findOutOfStockProducts();

    // Expiring soon products (within next X days)
    @Query("SELECT p FROM Product p WHERE p.expiryDate IS NOT NULL AND p.expiryDate <= :date AND p.isActive = true")
    List<Product> findExpiringBefore(@Param("date") LocalDate date);

    // Products expiring within days
    @Query("SELECT p FROM Product p WHERE p.expiryDate IS NOT NULL AND p.expiryDate BETWEEN CURRENT_DATE AND :endDate AND p.isActive = true")
    List<Product> findExpiringBetween(@Param("endDate") LocalDate endDate);

    // Products by category
    List<Product> findByCategoryId(Long categoryId);

    // Products by supplier
    List<Product> findBySupplierId(Long supplierId);

    // Search products by name or SKU
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    // Products with stock above max
    @Query("SELECT p FROM Product p WHERE p.currentStock > p.maxStock AND p.isActive = true")
    List<Product> findOverstockedProducts();

    // Paginated product list with filters
    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
            "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "p.isActive = true")
    Page<Product> findProductsWithFilters(@Param("categoryId") Long categoryId,
                                          @Param("supplierId") Long supplierId,
                                          @Param("search") String search,
                                          Pageable pageable);
}