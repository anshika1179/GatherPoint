package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
}
