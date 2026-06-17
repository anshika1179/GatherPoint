package com.GatherPoint.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private BigDecimal amount;

    private String method;

    private String transactionRef;

    private LocalDateTime createdAt;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;
}
