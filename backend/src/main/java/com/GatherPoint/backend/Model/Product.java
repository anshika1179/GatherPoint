package com.GatherPoint.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String productName;

    private BigDecimal price;

    private String uom;

    private BigDecimal tax;

    private String description;

    private String imageUrl;

    private boolean available = true;

    @ManyToOne
    private Category category;
}
