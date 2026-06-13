package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Model.KitchenTicket;
import com.GatherPoint.backend.Repo.KitchenTicketRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/kitchen")
public class KitchenController {

    @Autowired
    private KitchenTicketRepo kitchenTicketRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/orders")
    public List<KitchenTicket> getKitchenTickets() {
        return kitchenTicketRepo.findAll();
    }

    @PatchMapping("/orders/{id}/prepare")
    public ResponseEntity<?> prepareOrder(@PathVariable Long id) {
        Optional<KitchenTicket> opt = kitchenTicketRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        KitchenTicket ticket = opt.get();
        ticket.setStage("PREPARING");
        KitchenTicket saved = kitchenTicketRepo.save(ticket);

        // Broadcast to KDS / POS via WebSocket
        messagingTemplate.convertAndSend("/topic/kitchen", (Object) Map.of(
                "event", "ORDER_PREPARING",
                "ticket", saved
        ));

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/orders/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        Optional<KitchenTicket> opt = kitchenTicketRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        KitchenTicket ticket = opt.get();
        ticket.setStage("COMPLETED");
        KitchenTicket saved = kitchenTicketRepo.save(ticket);

        // Broadcast to KDS / POS via WebSocket
        messagingTemplate.convertAndSend("/topic/kitchen", (Object) Map.of(
                "event", "ORDER_COMPLETED",
                "ticket", saved
        ));

        return ResponseEntity.ok(saved);
    }
}
