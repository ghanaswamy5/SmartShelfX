package com.smartshelfx.scheduler;

import com.smartshelfx.entity.Product;
import com.smartshelfx.entity.User;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void checkLowStockAndExpiry() {
        log.info("Running scheduled check for low stock and expiring products");

        List<User> activeUsers = userRepository.findAllActiveUsers();

        // Check low stock products
        List<Product> lowStockProducts = productRepository.findLowStockProducts();
        for (Product product : lowStockProducts) {
            String message = String.format(
                "Product '%s' (SKU: %s) is low on stock. Current stock: %d, Reorder level: %d",
                product.getName(),
                product.getSku(),
                product.getCurrentStock(),
                product.getReorderLevel()
            );

            for (User user : activeUsers) {
                notificationService.createNotification(
                    user.getId(),
                    "LOW_STOCK",
                    "Low Stock Alert: " + product.getName(),
                    message,
                    "/products"
                );
            }
            log.info("Created low stock notification for product: {}", product.getSku());
        }

        // Check expiring products (within 30 days)
        List<Product> expiringProducts = productRepository.findExpiringBefore(LocalDate.now().plusDays(30));
        for (Product product : expiringProducts) {
            String message = String.format(
                "Product '%s' (SKU: %s) is expiring soon. Expiry date: %s",
                product.getName(),
                product.getSku(),
                product.getExpiryDate()
            );

            for (User user : activeUsers) {
                notificationService.createNotification(
                    user.getId(),
                    "EXPIRY",
                    "Expiry Alert: " + product.getName(),
                    message,
                    "/products"
                );
            }
            log.info("Created expiry notification for product: {}", product.getSku());
        }
    }
}