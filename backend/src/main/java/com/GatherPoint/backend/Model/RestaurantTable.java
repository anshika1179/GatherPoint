package com.GatherPoint.backend.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String tableNumber;

    private Integer seats;

    private boolean active;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("tables")
    private Floor floor;
}
