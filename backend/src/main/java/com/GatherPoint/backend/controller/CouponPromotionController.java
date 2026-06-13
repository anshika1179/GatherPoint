package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.Coupon;
import com.GatherPoint.backend.Model.Promotion;
import com.GatherPoint.backend.Repo.CouponRepo;
import com.GatherPoint.backend.Repo.PromotionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class CouponPromotionController {

    @Autowired
    private CouponRepo couponRepo;

    @Autowired
    private PromotionRepo promotionRepo;

    // --- COUPON MODULE ---

    @GetMapping("/coupons")
    public List<Coupon> getAllCoupons() {
        return couponRepo.findAll();
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        Coupon saved = couponRepo.save(coupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon couponDetails) {
        Optional<Coupon> opt = couponRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Coupon coupon = opt.get();
        coupon.setCode(couponDetails.getCode());
        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setActive(couponDetails.isActive());

        Coupon updated = couponRepo.save(coupon);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        if (!couponRepo.existsById(id)) return ResponseEntity.notFound().build();
        couponRepo.deleteById(id);
        return ResponseEntity.ok("Coupon deleted successfully");
    }

    // --- PROMOTION MODULE ---

    @GetMapping("/promotions")
    public List<Promotion> getAllPromotions() {
        return promotionRepo.findAll();
    }

    @PostMapping("/promotions")
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        Promotion saved = promotionRepo.save(promotion);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/promotions/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotionDetails) {
        Optional<Promotion> opt = promotionRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Promotion promotion = opt.get();
        promotion.setName(promotionDetails.getName());
        promotion.setDiscountType(promotionDetails.getDiscountType());
        promotion.setDiscountValue(promotionDetails.getDiscountValue());
        promotion.setScope(promotionDetails.getScope());
        promotion.setMinQuantity(promotionDetails.getMinQuantity());
        promotion.setMinOrderAmount(promotionDetails.getMinOrderAmount());
        promotion.setActive(promotionDetails.isActive());
        promotion.setProduct(promotionDetails.getProduct());

        Promotion updated = promotionRepo.save(promotion);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        if (!promotionRepo.existsById(id)) return ResponseEntity.notFound().build();
        promotionRepo.deleteById(id);
        return ResponseEntity.ok("Promotion deleted successfully");
    }
}
