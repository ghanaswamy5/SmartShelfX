package com.smartshelfx.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name must be less than 100 characters")
    private String name;

    private String description;
}