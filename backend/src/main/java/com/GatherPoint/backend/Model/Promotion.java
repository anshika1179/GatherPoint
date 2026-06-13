package com.GatherPoint.backend.Model;

import com.GatherPoint.backend.Constants.DiscountType;
import com.GatherPoint.backend.Constants.PromotionScope;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private BigDecimal discountValue;

    @Enumerated(EnumType.STRING)
    private PromotionScope scope;

    private Integer minQuantity;

    private BigDecimal minOrderAmount;

    private boolean active;

    @ManyToOne
    private Product product;
}
