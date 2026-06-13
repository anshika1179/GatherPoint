package com.GatherPoint.backend.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitchenTicketItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String productName;

    private Integer quantity;

    private boolean completed;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private KitchenTicket ticket;
}
