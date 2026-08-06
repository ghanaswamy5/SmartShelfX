package com.smartshelfx.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartshelfx.entity.Product;
import com.smartshelfx.entity.Sale;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public String getDemandForecast(Long productId) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Get sales data for this product (last 30 days)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Sale> sales = saleRepository.findSalesBetween(thirtyDaysAgo, LocalDateTime.now());

            long totalSold = sales.stream()
                    .flatMap(sale -> sale.getSaleItems().stream())
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .mapToLong(item -> item.getQuantity())
                    .sum();

            String prompt = String.format(
                """
                You are an inventory management expert. Analyze this product data and provide a demand forecast:

                Product: %s (SKU: %s)
                Current Stock: %d
                Reorder Level: %d
                Total Sold (Last 30 days): %d
                Selling Price: $%.2f
                Cost Price: $%.2f

                Please provide:
                1. Demand forecast for next 30 days
                2. Recommended reorder quantity
                3. Risk assessment (Low/Medium/High)
                4. Actionable recommendations
                Keep response concise and business-focused.
                """,
                product.getName(),
                product.getSku(),
                product.getCurrentStock(),
                product.getReorderLevel(),
                totalSold,
                product.getSellingPrice(),
                product.getCostPrice()
            );

            return callGeminiApi(prompt);

        } catch (Exception e) {
            log.error("Error getting demand forecast: {}", e.getMessage());
            return "Error generating forecast: " + e.getMessage();
        }
    }

    public String getRecommendations() {
        try {
            List<Product> lowStock = productRepository.findLowStockProducts();
            List<Product> expiring = productRepository.findExpiringBefore(LocalDate.now().plusDays(30));

            StringBuilder productData = new StringBuilder();
            productData.append("Low Stock Products:\n");
            for (Product p : lowStock) {
                productData.append(String.format("- %s (SKU: %s): Stock: %d, Reorder Level: %d\n",
                        p.getName(), p.getSku(), p.getCurrentStock(), p.getReorderLevel()));
            }

            productData.append("\nExpiring Products:\n");
            for (Product p : expiring) {
                productData.append(String.format("- %s (SKU: %s): Expiry: %s\n",
                        p.getName(), p.getSku(), p.getExpiryDate()));
            }

            String prompt = String.format(
                """
                You are an inventory management expert. Based on this inventory data, provide actionable recommendations:

                %s

                Please provide:
                1. Priority actions (urgent vs planned)
                2. Specific recommendations for each product
                3. Overall inventory health assessment
                4. Suggested next steps
                Keep response concise and actionable.
                """,
                productData.toString()
            );

            return callGeminiApi(prompt);

        } catch (Exception e) {
            log.error("Error getting recommendations: {}", e.getMessage());
            return "Error generating recommendations: " + e.getMessage();
        }
    }

    public String getMovementAnalysis() {
        try {
            // Get all products with their sales data
            List<Product> products = productRepository.findAll();
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Sale> sales = saleRepository.findSalesBetween(thirtyDaysAgo, LocalDateTime.now());

            StringBuilder analysisData = new StringBuilder();
            for (Product product : products) {
                long totalSold = sales.stream()
                        .flatMap(sale -> sale.getSaleItems().stream())
                        .filter(item -> item.getProduct().getId().equals(product.getId()))
                        .mapToLong(item -> item.getQuantity())
                        .sum();

                double turnoverRate = product.getCurrentStock() > 0 ?
                        (double) totalSold / product.getCurrentStock() : 0;

                analysisData.append(String.format(
                    "- %s: Stock: %d, Sold: %d, Turnover Rate: %.2f\n",
                    product.getName(), product.getCurrentStock(), totalSold, turnoverRate
                ));
            }

            String prompt = String.format(
                """
                You are an inventory movement analyst. Analyze this product movement data:

                %s

                Please provide:
                1. Product movement patterns
                2. Fast vs slow movers analysis
                3. Recommendations for slow-moving products
                4. Suggested restocking strategy
                Keep response concise and data-driven.
                """,
                analysisData.toString()
            );

            return callGeminiApi(prompt);

        } catch (Exception e) {
            log.error("Error getting movement analysis: {}", e.getMessage());
            return "Error generating movement analysis: " + e.getMessage();
        }
    }

    public String getSeasonalPrediction() {
        try {
            // Get sales data grouped by month
            LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
            List<Sale> sales = saleRepository.findSalesBetween(oneYearAgo, LocalDateTime.now());

            Map<String, Long> monthlySales = new HashMap<>();
            for (Sale sale : sales) {
                String month = sale.getSaleDate().format(DateTimeFormatter.ofPattern("MMM yyyy"));
                monthlySales.put(month, monthlySales.getOrDefault(month, 0L) + 1);
            }

            StringBuilder salesData = new StringBuilder();
            for (Map.Entry<String, Long> entry : monthlySales.entrySet()) {
                salesData.append(String.format("- %s: %d sales\n", entry.getKey(), entry.getValue()));
            }

            String prompt = String.format(
                """
                You are a seasonal trend analyst. Analyze this sales data and predict seasonal patterns:

                Monthly Sales Data:
                %s

                Please provide:
                1. Seasonal patterns detected
                2. Upcoming seasonal demands
                3. Inventory preparation recommendations
                4. Peak season predictions
                Keep response concise and actionable.
                """,
                salesData.toString()
            );

            return callGeminiApi(prompt);

        } catch (Exception e) {
            log.error("Error getting seasonal prediction: {}", e.getMessage());
            return "Error generating seasonal prediction: " + e.getMessage();
        }
    }

    public String getPurchaseSuggestions() {
        try {
            List<Product> lowStock = productRepository.findLowStockProducts();
            List<Product> expiring = productRepository.findExpiringBefore(LocalDate.now().plusDays(30));

            StringBuilder suggestionData = new StringBuilder();
            suggestionData.append("Products requiring attention:\n");
            for (Product p : lowStock) {
                suggestionData.append(String.format(
                    "- %s (SKU: %s): Need to reorder %d units (Current: %d, Reorder: %d)\n",
                    p.getName(), p.getSku(),
                    p.getReorderLevel() - p.getCurrentStock(),
                    p.getCurrentStock(),
                    p.getReorderLevel()
                ));
            }

            String prompt = String.format(
                """
                You are a purchasing advisor. Based on this inventory data, generate purchase suggestions:

                %s

                Please provide:
                1. Urgent purchase orders needed
                2. Quantity recommendations
                3. Supplier suggestions if applicable
                4. Priority order for purchases
                Keep response concise and actionable.
                """,
                suggestionData.toString()
            );

            return callGeminiApi(prompt);

        } catch (Exception e) {
            log.error("Error getting purchase suggestions: {}", e.getMessage());
            return "Error generating purchase suggestions: " + e.getMessage();
        }
    }

    public String chatWithAi(String userMessage) {
        try {
            String prompt = String.format(
                """
                You are SmartShelfX AI Assistant, an expert in inventory management.
                User question: %s

                Please provide a helpful, concise response focused on inventory management best practices.
                If the question is not about inventory, politely redirect to inventory topics.
                """,
                userMessage
            );

            return callGeminiApi(prompt);

        } catch (Exception e) {
            log.error("Error in AI chat: {}", e.getMessage());
            return "I'm sorry, I'm having trouble processing your request. Please try again later.";
        }
    }

    private String callGeminiApi(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            log.warn("Gemini API key not configured. Returning mock response.");
            return getMockResponse(prompt);
        }

        try {
            String url = GEMINI_URL + "?key=" + apiKey;

            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = objectMapper.createArrayNode();

            ObjectNode content = objectMapper.createObjectNode();
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", prompt);
            parts.add(part);
            content.set("parts", parts);
            contents.add(content);
            requestBody.set("contents", contents);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            // Make API call
            String response = restTemplate.postForObject(url, request, String.class);

            // Parse response
            JsonNode responseJson = objectMapper.readTree(response);
            String result = responseJson
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            return result != null && !result.isEmpty() ? result : "No response from AI.";

        } catch (RestClientException e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return getMockResponse(prompt);
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API: {}", e.getMessage());
            return getMockResponse(prompt);
        }
    }

    private String getMockResponse(String prompt) {
        if (prompt.contains("demand forecast")) {
            return """
                    📊 **Demand Forecast Analysis**

                    Based on historical data and current trends:
                    - **30-Day Demand Forecast:** 25-35 units
                    - **Recommended Reorder Quantity:** 40 units
                    - **Risk Assessment:** Medium
                    - **Action:** Reorder within the next 5-7 days

                    *Note: This is a simulated response. Configure Gemini API key for real AI analysis.*
                    """;
        } else if (prompt.contains("recommendations")) {
            return """
                    💡 **Inventory Recommendations**

                    **Priority Actions:**
                    1. 🔴 **URGENT:** Reorder low stock items (3 products below reorder level)
                    2. 🟡 **PLANNED:** Review expiring products (2 products expiring in 30 days)
                    3. 🟢 **OPTIMIZE:** Consider running promotions on slow-moving items

                    *Note: This is a simulated response. Configure Gemini API key for real AI analysis.*
                    """;
        } else {
            return """
                    🤖 **SmartShelfX AI Assistant**

                    I'm here to help with your inventory management needs!

                    **I can help with:**
                    - Demand forecasting
                    - Stock recommendations
                    - Seasonal trends analysis
                    - Purchase suggestions
                    - Inventory movement analysis

                    *Note: This is a simulated response. Configure Gemini API key for real AI analysis.*
                    """;
        }
    }
}