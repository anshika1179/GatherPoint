package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentMethodRepo extends JpaRepository<PaymentMethod, Long> {
}
