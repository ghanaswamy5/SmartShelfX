package com.smartshelfx.service;

import com.smartshelfx.dto.request.SaleRequest;
import com.smartshelfx.dto.response.SaleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleService {
    SaleResponse createSale(SaleRequest request, Long userId);
    SaleResponse getSaleById(Long id);
    SaleResponse getSaleByNumber(String saleNumber);
    Page<SaleResponse> getAllSales(Pageable pageable);
    Page<SaleResponse> getSalesByUser(Long userId, Pageable pageable);
    List<SaleResponse> getSalesBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<SaleResponse> getSalesByDateRange(String startDate, String endDate);
    SaleResponse cancelSale(Long id);
}