package com.smartshelfx.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    @Size(max = 100, message = "Supplier name must be less than 100 characters")
    private String name;

    @Size(max = 100, message = "Contact name must be less than 100 characters")
    private String contactName;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;

    @Size(max = 20, message = "Phone must be less than 20 characters")
    private String phone;

    private String address;
}