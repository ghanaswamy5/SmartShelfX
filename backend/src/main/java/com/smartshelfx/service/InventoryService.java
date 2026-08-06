package com.smartshelfx.service;

import com.smartshelfx.dto.request.InventoryMovementRequest;
import com.smartshelfx.dto.response.InventoryMovementResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryService {
    InventoryMovementResponse createMovement(InventoryMovementRequest request, Long userId);
    List<InventoryMovementResponse> getMovementsByProduct(Long productId);
    List<InventoryMovementResponse> getMovementsByType(String movementType);
    List<InventoryMovementResponse> getMovementsBetween(LocalDateTime startDate, LocalDateTime endDate);
    InventoryMovementResponse getMovementById(Long id);
}