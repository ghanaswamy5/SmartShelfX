package com.smartshelfx.controller;

import com.smartshelfx.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/products/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> exportProducts() {
        ByteArrayOutputStream out = reportService.exportProductsCsv();
        return downloadResponse(out, "products-report.csv");
    }

    @GetMapping("/sales/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> exportSales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        ByteArrayOutputStream out = reportService.exportSalesCsv(
                startDate.toString(),
                endDate.toString()
        );
        return downloadResponse(out, "sales-report.csv");
    }

    @GetMapping("/low-stock/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> exportLowStock() {
        ByteArrayOutputStream out = reportService.exportLowStockCsv();
        return downloadResponse(out, "low-stock-report.csv");
    }

    @GetMapping("/inventory/export/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Resource> exportInventory(@PathVariable Long productId) {
        ByteArrayOutputStream out = reportService.exportInventoryCsv(productId);
        return downloadResponse(out, "inventory-report-product-" + productId + ".csv");
    }

    private ResponseEntity<Resource> downloadResponse(ByteArrayOutputStream out, String filename) {
        ByteArrayResource resource = new ByteArrayResource(out.toByteArray());
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(out.size())
                .body(resource);
    }
}