package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PromotionRepo extends JpaRepository<Promotion, Long> {
    List<Promotion> findByActiveTrue();
    List<Promotion> findByProductId(Long productId);
}
