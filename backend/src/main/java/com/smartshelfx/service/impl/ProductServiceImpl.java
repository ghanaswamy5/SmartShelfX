package com.smartshelfx.service.impl;

import com.smartshelfx.dto.request.ProductRequest;
import com.smartshelfx.dto.response.ProductResponse;
import com.smartshelfx.entity.Category;
import com.smartshelfx.entity.Product;
import com.smartshelfx.entity.Supplier;
import com.smartshelfx.exception.ResourceNotFoundException;
import com.smartshelfx.repository.CategoryRepository;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.SupplierRepository;
import com.smartshelfx.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        // Check if SKU already exists
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }

        Product product = mapToEntity(request);
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Check if SKU is being changed and if new SKU already exists
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }

        updateEntity(product, request);
        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return mapToResponse(product);
    }

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts(pageable);
        }
        return productRepository.findProductsWithFilters(null, null, keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getExpiringProducts(int days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        return productRepository.findExpiringBetween(endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Product mapToEntity(ProductRequest request) {
        Product product = new Product();
        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setCurrentStock(request.getCurrentStock());
        product.setReorderLevel(request.getReorderLevel());
        product.setReorderQuantity(request.getReorderQuantity());
        product.setMinStock(request.getMinStock());
        product.setMaxStock(request.getMaxStock());
        product.setUnit(request.getUnit());
        product.setExpiryDate(request.getExpiryDate());
        product.setIsActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
            product.setSupplier(supplier);
        }

        return product;
    }

    private void updateEntity(Product product, ProductRequest request) {
        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setCurrentStock(request.getCurrentStock());
        product.setReorderLevel(request.getReorderLevel());
        product.setReorderQuantity(request.getReorderQuantity());
        product.setMinStock(request.getMinStock());
        product.setMaxStock(request.getMaxStock());
        product.setUnit(request.getUnit());
        product.setExpiryDate(request.getExpiryDate());
        product.setIsActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .reorderQuantity(product.getReorderQuantity())
                .minStock(product.getMinStock())
                .maxStock(product.getMaxStock())
                .unit(product.getUnit())
                .expiryDate(product.getExpiryDate())
                .isActive(product.getIsActive())
                .isLowStock(product.isLowStock())
                .isOutOfStock(product.isOutOfStock())
                .isExpiringSoon(product.isExpiringSoon())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}