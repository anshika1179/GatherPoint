package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.PosSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PosSessionRepo extends JpaRepository<PosSession, Long> {
    Optional<PosSession> findByEmployeeIdAndClosedAtIsNull(Long employeeId);
    List<PosSession> findByEmployeeId(Long employeeId);
}
