package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepo extends JpaRepository<Promotion, Long> {
}
