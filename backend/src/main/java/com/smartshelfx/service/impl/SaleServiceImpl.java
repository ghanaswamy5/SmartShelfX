package com.smartshelfx.service.impl;

import com.smartshelfx.dto.request.SaleRequest;
import com.smartshelfx.dto.request.SaleItemRequest;
import com.smartshelfx.dto.response.SaleResponse;
import com.smartshelfx.dto.response.SaleItemResponse;
import com.smartshelfx.entity.*;
import com.smartshelfx.exception.ResourceNotFoundException;
import com.smartshelfx.repository.InventoryMovementRepository;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.SaleRepository;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    @Override
    public SaleResponse createSale(SaleRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Sale sale = new Sale();
        sale.setUser(user);
        sale.setCustomerName(request.getCustomerName());
        sale.setCustomerEmail(request.getCustomerEmail());
        sale.setCustomerPhone(request.getCustomerPhone());
        sale.setSaleDate(LocalDateTime.now());
        sale.setDiscountPercent(request.getDiscountPercent());
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setPaymentStatus("COMPLETED");
        sale.setNotes(request.getNotes());

        // Generate sale number
        String saleNumber = generateSaleNumber();
        sale.setSaleNumber(saleNumber);

        // Process items and deduct stock
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            // Check stock availability
            if (product.getCurrentStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getCurrentStock() + ", Requested: " + itemRequest.getQuantity());
            }

            SaleItem saleItem = new SaleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(itemRequest.getQuantity());
            saleItem.setUnitPrice(itemRequest.getUnitPrice());
            saleItem.setDiscountPercent(itemRequest.getDiscountPercent());
            saleItem.calculateTotalPrice();

            // Update product stock
            int previousStock = product.getCurrentStock();
            product.setCurrentStock(product.getCurrentStock() - itemRequest.getQuantity());
            productRepository.save(product);

            // Create inventory movement for stock deduction
            InventoryMovement movement = new InventoryMovement();
            movement.setProduct(product);
            movement.setMovementType("OUT");
            movement.setQuantity(itemRequest.getQuantity());
            movement.setPreviousStock(previousStock);
            movement.setNewStock(product.getCurrentStock());
            movement.setReferenceId(saleNumber);
            movement.setReferenceType("SALE");
            movement.setNotes("Stock deducted for sale: " + saleNumber);
            movement.setUser(user);
            inventoryMovementRepository.save(movement);

            sale.addSaleItem(saleItem);
            subtotal = subtotal.add(saleItem.getTotalPrice());
            totalDiscount = totalDiscount.add(saleItem.getDiscountAmount());
        }

        sale.setSubtotal(subtotal);
        sale.setDiscountAmount(totalDiscount);

        // Calculate tax (assuming 10% tax on subtotal after discount)
        BigDecimal afterDiscount = subtotal.subtract(totalDiscount);
        BigDecimal taxAmount = afterDiscount.multiply(new BigDecimal("0.10"));
        sale.setTaxAmount(taxAmount);

        BigDecimal totalAmount = afterDiscount.add(taxAmount);
        sale.setTotalAmount(totalAmount);

        Sale savedSale = saleRepository.save(sale);
        return mapToResponse(savedSale);
    }

    @Override
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return mapToResponse(sale);
    }

    @Override
    public SaleResponse getSaleByNumber(String saleNumber) {
        Sale sale = saleRepository.findBySaleNumber(saleNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with number: " + saleNumber));
        return mapToResponse(sale);
    }

    @Override
    public Page<SaleResponse> getAllSales(Pageable pageable) {
        return saleRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<SaleResponse> getSalesByUser(Long userId, Pageable pageable) {
        return saleRepository.findByUserId(userId, pageable).map(this::mapToResponse);
    }

    @Override
    public List<SaleResponse> getSalesBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return saleRepository.findSalesBetween(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SaleResponse> getSalesByDateRange(String startDate, String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
        LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
        return getSalesBetween(start, end);
    }

    @Override
    public SaleResponse cancelSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));

        if ("CANCELLED".equals(sale.getPaymentStatus())) {
            throw new RuntimeException("Sale is already cancelled");
        }

        // Restore stock for each item
        for (SaleItem item : sale.getSaleItems()) {
            Product product = item.getProduct();
            int previousStock = product.getCurrentStock();
            product.setCurrentStock(product.getCurrentStock() + item.getQuantity());
            productRepository.save(product);

            // Create inventory movement for stock restoration
            InventoryMovement movement = new InventoryMovement();
            movement.setProduct(product);
            movement.setMovementType("IN");
            movement.setQuantity(item.getQuantity());
            movement.setPreviousStock(previousStock);
            movement.setNewStock(product.getCurrentStock());
            movement.setReferenceId(sale.getSaleNumber());
            movement.setReferenceType("SALE_CANCELLED");
            movement.setNotes("Stock restored from cancelled sale: " + sale.getSaleNumber());
            movement.setUser(sale.getUser());
            inventoryMovementRepository.save(movement);
        }

        sale.setPaymentStatus("CANCELLED");
        Sale cancelled = saleRepository.save(sale);
        return mapToResponse(cancelled);
    }

    private String generateSaleNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = saleRepository.count() + 1;
        return "SALE-" + date + "-" + String.format("%04d", count);
    }

    private SaleResponse mapToResponse(Sale sale) {
        return SaleResponse.builder()
                .id(sale.getId())
                .saleNumber(sale.getSaleNumber())
                .userId(sale.getUser().getId())
                .username(sale.getUser().getUsername())
                .customerName(sale.getCustomerName())
                .customerEmail(sale.getCustomerEmail())
                .customerPhone(sale.getCustomerPhone())
                .saleDate(sale.getSaleDate())
                .subtotal(sale.getSubtotal())
                .discountPercent(sale.getDiscountPercent())
                .discountAmount(sale.getDiscountAmount())
                .taxAmount(sale.getTaxAmount())
                .totalAmount(sale.getTotalAmount())
                .paymentMethod(sale.getPaymentMethod())
                .paymentStatus(sale.getPaymentStatus())
                .notes(sale.getNotes())
                .items(sale.getSaleItems().stream().map(this::mapToItemResponse).collect(Collectors.toList()))
                .createdAt(sale.getCreatedAt())
                .build();
    }

    private SaleItemResponse mapToItemResponse(SaleItem item) {
        return SaleItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountPercent(item.getDiscountPercent())
                .discountAmount(item.getDiscountAmount())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}