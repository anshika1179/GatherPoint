package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CouponRepo extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    Optional<Coupon> findByCodeIgnoreCase(String code);
}
