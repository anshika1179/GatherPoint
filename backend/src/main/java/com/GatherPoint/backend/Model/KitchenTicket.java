package com.GatherPoint.backend.Model;

import com.GatherPoint.backend.Constants.TicketStage;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitchenTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String orderNumber;

    @Enumerated(EnumType.STRING)
    private TicketStage stage;

    private LocalDateTime createdAt;

    @OneToOne
    private Order order;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL)
    private List<KitchenTicketItem> items;
}
