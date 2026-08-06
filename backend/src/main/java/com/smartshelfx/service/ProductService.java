package com.smartshelfx.service;

import com.smartshelfx.dto.request.ProductRequest;
import com.smartshelfx.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    ProductResponse getProductById(Long id);
    ProductResponse getProductBySku(String sku);
    Page<ProductResponse> getAllProducts(Pageable pageable);
    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);
    List<ProductResponse> getLowStockProducts();
    List<ProductResponse> getOutOfStockProducts();
    List<ProductResponse> getExpiringProducts(int days);
    List<ProductResponse> getProductsByCategory(Long categoryId);
    List<ProductResponse> getProductsBySupplier(Long supplierId);
}