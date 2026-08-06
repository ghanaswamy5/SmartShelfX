package com.smartshelfx.service.impl;

import com.smartshelfx.entity.InventoryMovement;
import com.smartshelfx.entity.Product;
import com.smartshelfx.entity.Sale;
import com.smartshelfx.repository.InventoryMovementRepository;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.SaleRepository;
import com.smartshelfx.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final InventoryMovementRepository inventoryMovementRepository;

    private static final String CSV_HEADER_PRODUCTS = "ID,SKU,Barcode,Name,Category,Supplier,Cost Price,Selling Price,Current Stock,Reorder Level,Unit,Expiry Date,Status";
    private static final String CSV_HEADER_SALES = "Sale Number,Date,Customer,Subtotal,Discount,Tax,Total,Payment Method,Status";
    private static final String CSV_HEADER_LOW_STOCK = "ID,SKU,Name,Category,Current Stock,Reorder Level,Min Stock,Max Stock,Supplier";
    private static final String CSV_HEADER_INVENTORY = "Date,Product,Type,Quantity,Previous Stock,New Stock,Reference,User,Notes";

    @Override
    public ByteArrayOutputStream exportProductsCsv() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            
            writer.println(CSV_HEADER_PRODUCTS);
            
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                writer.println(String.format("%d,%s,%s,%s,%s,%s,%.2f,%.2f,%d,%d,%s,%s,%s",
                        p.getId(),
                        escapeCsv(p.getSku()),
                        escapeCsv(p.getBarcode()),
                        escapeCsv(p.getName()),
                        p.getCategory() != null ? escapeCsv(p.getCategory().getName()) : "",
                        p.getSupplier() != null ? escapeCsv(p.getSupplier().getName()) : "",
                        p.getCostPrice(),
                        p.getSellingPrice(),
                        p.getCurrentStock(),
                        p.getReorderLevel(),
                        escapeCsv(p.getUnit()),
                        p.getExpiryDate() != null ? p.getExpiryDate().toString() : "",
                        p.getIsActive() ? "Active" : "Inactive"
                ));
            }
            writer.flush();
        }
        return out;
    }

    @Override
    public ByteArrayOutputStream exportSalesCsv(String startDate, String endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            
            writer.println(CSV_HEADER_SALES);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            
            List<Sale> sales = saleRepository.findSalesBetween(start, end);
            for (Sale s : sales) {
                writer.println(String.format("%s,%s,%s,%.2f,%.2f,%.2f,%.2f,%s,%s",
                        escapeCsv(s.getSaleNumber()),
                        s.getSaleDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                        escapeCsv(s.getCustomerName()),
                        s.getSubtotal(),
                        s.getDiscountAmount(),
                        s.getTaxAmount(),
                        s.getTotalAmount(),
                        escapeCsv(s.getPaymentMethod()),
                        escapeCsv(s.getPaymentStatus())
                ));
            }
            writer.flush();
        }
        return out;
    }

    @Override
    public ByteArrayOutputStream exportLowStockCsv() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            
            writer.println(CSV_HEADER_LOW_STOCK);
            
            List<Product> lowStock = productRepository.findLowStockProducts();
            for (Product p : lowStock) {
                writer.println(String.format("%d,%s,%s,%s,%d,%d,%d,%d,%s",
                        p.getId(),
                        escapeCsv(p.getSku()),
                        escapeCsv(p.getName()),
                        p.getCategory() != null ? escapeCsv(p.getCategory().getName()) : "",
                        p.getCurrentStock(),
                        p.getReorderLevel(),
                        p.getMinStock() != null ? p.getMinStock() : 0,
                        p.getMaxStock() != null ? p.getMaxStock() : 0,
                        p.getSupplier() != null ? escapeCsv(p.getSupplier().getName()) : ""
                ));
            }
            writer.flush();
        }
        return out;
    }

    @Override
    public ByteArrayOutputStream exportInventoryCsv(Long productId) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            
            writer.println(CSV_HEADER_INVENTORY);
            
            List<InventoryMovement> movements = inventoryMovementRepository.findByProductId(productId);
            for (InventoryMovement m : movements) {
                writer.println(String.format("%s,%s,%s,%d,%d,%d,%s,%s,%s",
                        m.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                        escapeCsv(m.getProduct().getName()),
                        escapeCsv(m.getMovementType()),
                        m.getQuantity(),
                        m.getPreviousStock(),
                        m.getNewStock(),
                        escapeCsv(m.getReferenceId()),
                        escapeCsv(m.getUser().getUsername()),
                        escapeCsv(m.getNotes())
                ));
            }
            writer.flush();
        }
        return out;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}