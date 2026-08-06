package com.smartshelfx.repository;

import com.smartshelfx.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    // Movements by product
    @Query("SELECT im FROM InventoryMovement im WHERE im.product.id = :productId ORDER BY im.createdAt DESC")
    List<InventoryMovement> findByProductId(@Param("productId") Long productId);
    
    // Movements by type
    @Query("SELECT im FROM InventoryMovement im WHERE im.movementType = :type ORDER BY im.createdAt DESC")
    List<InventoryMovement> findByMovementType(@Param("type") String type);
    
    // Movements by date range
    @Query("SELECT im FROM InventoryMovement im WHERE im.createdAt BETWEEN :startDate AND :endDate ORDER BY im.createdAt DESC")
    List<InventoryMovement> findBetweenDates(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
    
    // Movements by user
    @Query("SELECT im FROM InventoryMovement im WHERE im.user.id = :userId ORDER BY im.createdAt DESC")
    List<InventoryMovement> findByUserId(@Param("userId") Long userId);
    
    // Total movement by type
    @Query("SELECT im.movementType, SUM(im.quantity) FROM InventoryMovement im WHERE im.product.id = :productId GROUP BY im.movementType")
    List<Object[]> getMovementSummaryByProduct(@Param("productId") Long productId);
}