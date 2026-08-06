package com.smartshelfx.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "sale_number", nullable = false, unique = true, length = 50)
    private String saleNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "sale_date")
    private LocalDateTime saleDate = LocalDateTime.now();

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @NotNull
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "CASH";

    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "COMPLETED";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SaleItem> saleItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper method to add sale item
    public void addSaleItem(SaleItem item) {
        saleItems.add(item);
        item.setSale(this);
        recalculateTotals();
    }

    // Helper method to recalculate totals
    public void recalculateTotals() {
        if (saleItems.isEmpty()) {
            subtotal = BigDecimal.ZERO;
            totalAmount = BigDecimal.ZERO;
            return;
        }

        subtotal = saleItems.stream()
                .map(SaleItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply discount
        BigDecimal discount = subtotal.multiply(discountPercent).divide(new BigDecimal(100));
        discountAmount = discount;
        BigDecimal afterDiscount = subtotal.subtract(discount);

        // Apply tax (assuming 10% tax for simplicity)
        taxAmount = afterDiscount.multiply(new BigDecimal("0.10"));
        totalAmount = afterDiscount.add(taxAmount);
    }
}