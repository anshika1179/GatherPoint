package com.GatherPoint.backend.Repo;

import com.GatherPoint.backend.Model.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantTableRepo extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByFloorId(Long floorId);
    List<RestaurantTable> findByActiveTrue();
}
