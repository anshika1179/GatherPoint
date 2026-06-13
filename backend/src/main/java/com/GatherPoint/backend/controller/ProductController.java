package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.Category;
import com.GatherPoint.backend.Model.Product;
import com.GatherPoint.backend.Repo.CategoryRepo;
import com.GatherPoint.backend.Repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    // --- CATEGORY MODULE ---
    
    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category saved = categoryRepo.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        Optional<Category> opt = categoryRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Category category = opt.get();
        category.setName(categoryDetails.getName());
        category.setColor(categoryDetails.getColor());
        Category updated = categoryRepo.save(category);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepo.existsById(id)) return ResponseEntity.notFound().build();
        categoryRepo.deleteById(id);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // --- PRODUCT MODULE ---

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        if (product.getCategory() != null && product.getCategory().getId() > 0) {
            Optional<Category> catOpt = categoryRepo.findById(product.getCategory().getId());
            if (catOpt.isPresent()) {
                product.setCategory(catOpt.get());
            } else {
                return ResponseEntity.badRequest().body("Invalid Category ID provided!");
            }
        }
        Product saved = productRepo.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Optional<Product> opt = productRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Product product = opt.get();
        product.setProductName(productDetails.getProductName());
        product.setPrice(productDetails.getPrice());
        product.setUom(productDetails.getUom());
        product.setTax(productDetails.getTax());
        product.setDescription(productDetails.getDescription());
        product.setImageUrl(productDetails.getImageUrl());
        product.setAvailable(productDetails.isAvailable());

        if (productDetails.getCategory() != null && productDetails.getCategory().getId() > 0) {
            Optional<Category> catOpt = categoryRepo.findById(productDetails.getCategory().getId());
            if (catOpt.isPresent()) {
                product.setCategory(catOpt.get());
            } else {
                return ResponseEntity.badRequest().body("Invalid Category ID!");
            }
        }

        Product updated = productRepo.save(product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepo.existsById(id)) return ResponseEntity.notFound().build();
        productRepo.deleteById(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
