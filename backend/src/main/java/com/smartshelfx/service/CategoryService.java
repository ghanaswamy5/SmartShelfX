package com.smartshelfx.service;

import com.smartshelfx.dto.request.CategoryRequest;
import com.smartshelfx.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    CategoryResponse getCategoryById(Long id);
    CategoryResponse getCategoryByName(String name);
    List<CategoryResponse> getAllCategories();
    List<CategoryResponse> getCategoriesWithProductCount();
}