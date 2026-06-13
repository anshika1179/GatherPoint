package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRepo extends JpaRepository<Customer, Long> {
    List<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}
