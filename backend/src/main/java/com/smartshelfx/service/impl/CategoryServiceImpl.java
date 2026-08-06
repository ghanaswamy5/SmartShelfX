package com.smartshelfx.service.impl;

import com.smartshelfx.dto.request.CategoryRequest;
import com.smartshelfx.dto.response.CategoryResponse;
import com.smartshelfx.entity.Category;
import com.smartshelfx.exception.ResourceNotFoundException;
import com.smartshelfx.repository.CategoryRepository;
import com.smartshelfx.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category with name " + request.getName() + " already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category with name " + request.getName() + " already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse getCategoryByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + name));
        return mapToResponse(category);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getCategoriesWithProductCount() {
        return categoryRepository.findCategoriesWithProductCount().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .productCount(category.getProducts() != null ? (long) category.getProducts().size() : 0L)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}