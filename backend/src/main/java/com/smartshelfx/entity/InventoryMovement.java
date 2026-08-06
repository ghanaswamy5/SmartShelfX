package com.smartshelfx.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank
    @Size(max = 20)
    @Column(name = "movement_type", nullable = false, length = 20)
    private String movementType; // 'IN', 'OUT', 'TRANSFER', 'DAMAGE'

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "previous_stock", nullable = false)
    private Integer previousStock;

    @NotNull
    @Column(name = "new_stock", nullable = false)
    private Integer newStock;

    @Size(max = 100)
    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Size(max = 50)
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}