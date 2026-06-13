package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.Floor;
import com.GatherPoint.backend.Model.RestaurantTable;
import com.GatherPoint.backend.Repo.FloorRepo;
import com.GatherPoint.backend.Repo.RestaurantTableRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class FloorTableController {

    @Autowired
    private FloorRepo floorRepo;

    @Autowired
    private RestaurantTableRepo tableRepo;

    // --- FLOOR MODULE ---

    @GetMapping("/floors")
    public List<Floor> getAllFloors() {
        return floorRepo.findAll();
    }

    @PostMapping("/floors")
    public ResponseEntity<Floor> createFloor(@RequestBody Floor floor) {
        Floor saved = floorRepo.save(floor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/floors/{id}")
    public ResponseEntity<?> updateFloor(@PathVariable Long id, @RequestBody Floor floorDetails) {
        Optional<Floor> opt = floorRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Floor floor = opt.get();
        floor.setName(floorDetails.getName());
        Floor updated = floorRepo.save(floor);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/floors/{id}")
    public ResponseEntity<?> deleteFloor(@PathVariable Long id) {
        if (!floorRepo.existsById(id)) return ResponseEntity.notFound().build();
        floorRepo.deleteById(id);
        return ResponseEntity.ok("Floor deleted successfully");
    }

    // --- TABLE MODULE ---

    @GetMapping("/tables")
    public List<RestaurantTable> getAllTables() {
        return tableRepo.findAll();
    }

    @PostMapping("/tables")
    public ResponseEntity<?> createTable(@RequestBody RestaurantTable table) {
        if (table.getFloor() != null && table.getFloor().getId() > 0) {
            Optional<Floor> floorOpt = floorRepo.findById(table.getFloor().getId());
            if (floorOpt.isPresent()) {
                table.setFloor(floorOpt.get());
            } else {
                return ResponseEntity.badRequest().body("Invalid Floor ID!");
            }
        }
        RestaurantTable saved = tableRepo.save(table);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/tables/{id}")
    public ResponseEntity<?> updateTable(@PathVariable Long id, @RequestBody RestaurantTable tableDetails) {
        Optional<RestaurantTable> opt = tableRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RestaurantTable table = opt.get();
        table.setTableNumber(tableDetails.getTableNumber());
        table.setSeats(tableDetails.getSeats());
        table.setActive(tableDetails.isActive());

        if (tableDetails.getFloor() != null && tableDetails.getFloor().getId() > 0) {
            Optional<Floor> floorOpt = floorRepo.findById(tableDetails.getFloor().getId());
            if (floorOpt.isPresent()) {
                table.setFloor(floorOpt.get());
            } else {
                return ResponseEntity.badRequest().body("Invalid Floor ID!");
            }
        }

        RestaurantTable updated = tableRepo.save(table);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/tables/{id}")
    public ResponseEntity<?> deleteTable(@PathVariable Long id) {
        if (!tableRepo.existsById(id)) return ResponseEntity.notFound().build();
        tableRepo.deleteById(id);
        return ResponseEntity.ok("Table deleted successfully");
    }
}
