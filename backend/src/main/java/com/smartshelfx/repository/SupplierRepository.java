package com.smartshelfx.repository;

import com.smartshelfx.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByName(String name);
    boolean existsByName(String name);
    
    @Query("SELECT s FROM Supplier s LEFT JOIN s.products p GROUP BY s.id ORDER BY COUNT(p) DESC")
    List<Supplier> findSuppliersWithProductCount();
}