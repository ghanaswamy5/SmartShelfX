package com.smartshelfx.service.impl;

import com.smartshelfx.dto.request.InventoryMovementRequest;
import com.smartshelfx.dto.response.InventoryMovementResponse;
import com.smartshelfx.entity.InventoryMovement;
import com.smartshelfx.entity.Product;
import com.smartshelfx.entity.User;
import com.smartshelfx.exception.ResourceNotFoundException;
import com.smartshelfx.repository.InventoryMovementRepository;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public InventoryMovementResponse createMovement(InventoryMovementRequest request, Long userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        int previousStock = product.getCurrentStock();
        int newStock = previousStock;

        // Validate and calculate new stock based on movement type
        switch (request.getMovementType().toUpperCase()) {
            case "IN":
                newStock = previousStock + request.getQuantity();
                break;
            case "OUT":
                if (previousStock < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + previousStock + ", Requested: " + request.getQuantity());
                }
                newStock = previousStock - request.getQuantity();
                break;
            case "TRANSFER":
                // For transfer, we'll just deduct from current location
                if (previousStock < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for transfer. Available: " + previousStock + ", Requested: " + request.getQuantity());
                }
                newStock = previousStock - request.getQuantity();
                break;
            case "DAMAGE":
                if (previousStock < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for damage write-off. Available: " + previousStock + ", Requested: " + request.getQuantity());
                }
                newStock = previousStock - request.getQuantity();
                break;
            default:
                throw new RuntimeException("Invalid movement type: " + request.getMovementType());
        }

        // Update product stock
        product.setCurrentStock(newStock);
        productRepository.save(product);

        // Create inventory movement record
        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setMovementType(request.getMovementType().toUpperCase());
        movement.setQuantity(request.getQuantity());
        movement.setPreviousStock(previousStock);
        movement.setNewStock(newStock);
        movement.setReferenceId(request.getReferenceId());
        movement.setReferenceType(request.getReferenceType());
        movement.setNotes(request.getNotes());
        movement.setUser(user);

        InventoryMovement saved = inventoryMovementRepository.save(movement);
        return mapToResponse(saved);
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByProduct(Long productId) {
        return inventoryMovementRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByType(String movementType) {
        return inventoryMovementRepository.findByMovementType(movementType.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementResponse> getMovementsBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return inventoryMovementRepository.findBetweenDates(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryMovementResponse getMovementById(Long id) {
        InventoryMovement movement = inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory movement not found with id: " + id));
        return mapToResponse(movement);
    }

    private InventoryMovementResponse mapToResponse(InventoryMovement movement) {
        return InventoryMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProduct().getId())
                .productName(movement.getProduct().getName())
                .productSku(movement.getProduct().getSku())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .previousStock(movement.getPreviousStock())
                .newStock(movement.getNewStock())
                .referenceId(movement.getReferenceId())
                .referenceType(movement.getReferenceType())
                .notes(movement.getNotes())
                .userId(movement.getUser().getId())
                .username(movement.getUser().getUsername())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}