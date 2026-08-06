package com.smartshelfx.service;

import com.smartshelfx.dto.request.SupplierRequest;
import com.smartshelfx.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse createSupplier(SupplierRequest request);
    SupplierResponse updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
    SupplierResponse getSupplierById(Long id);
    SupplierResponse getSupplierByName(String name);
    List<SupplierResponse> getAllSuppliers();
    List<SupplierResponse> getSuppliersWithProductCount();
}