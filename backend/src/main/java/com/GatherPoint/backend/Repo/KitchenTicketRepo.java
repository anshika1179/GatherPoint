package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Constants.TicketStage;
import com.GatherPoint.backend.Model.KitchenTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface KitchenTicketRepo extends JpaRepository<KitchenTicket, Long> {
    List<KitchenTicket> findByStage(TicketStage stage);
    Optional<KitchenTicket> findByOrderId(Long orderId);
}
