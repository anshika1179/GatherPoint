package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.KitchenTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KitchenTicketRepo extends JpaRepository<KitchenTicket, Long> {
}
