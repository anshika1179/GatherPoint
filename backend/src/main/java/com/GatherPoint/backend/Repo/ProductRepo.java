package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByProductNameContainingIgnoreCase(String name);
}
