package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.KitchenTicketItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KitchenTicketItemRepo extends JpaRepository<KitchenTicketItem, Long> {
}
