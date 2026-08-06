package com.smartshelfx.service.impl;

import com.smartshelfx.dto.request.SupplierRequest;
import com.smartshelfx.dto.response.SupplierResponse;
import com.smartshelfx.entity.Supplier;
import com.smartshelfx.exception.ResourceNotFoundException;
import com.smartshelfx.repository.SupplierRepository;
import com.smartshelfx.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByName(request.getName())) {
            throw new RuntimeException("Supplier with name " + request.getName() + " already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactName(request.getContactName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());

        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!supplier.getName().equals(request.getName()) && supplierRepository.existsByName(request.getName())) {
            throw new RuntimeException("Supplier with name " + request.getName() + " already exists");
        }

        supplier.setName(request.getName());
        supplier.setContactName(request.getContactName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());

        Supplier updated = supplierRepository.save(supplier);
        return mapToResponse(updated);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
    }

    @Override
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return mapToResponse(supplier);
    }

    @Override
    public SupplierResponse getSupplierByName(String name) {
        Supplier supplier = supplierRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with name: " + name));
        return mapToResponse(supplier);
    }

    @Override
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SupplierResponse> getSuppliersWithProductCount() {
        return supplierRepository.findSuppliersWithProductCount().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactName(supplier.getContactName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .productCount(supplier.getProducts() != null ? (long) supplier.getProducts().size() : 0L)
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}