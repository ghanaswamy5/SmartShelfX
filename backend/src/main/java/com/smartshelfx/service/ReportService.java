package com.smartshelfx.service;

import java.io.ByteArrayOutputStream;

public interface ReportService {
    ByteArrayOutputStream exportProductsCsv();
    ByteArrayOutputStream exportSalesCsv(String startDate, String endDate);
    ByteArrayOutputStream exportLowStockCsv();
    ByteArrayOutputStream exportInventoryCsv(Long productId);
}