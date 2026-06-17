package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Constants.OrderStatus;
import com.GatherPoint.backend.Constants.TicketStage;
import com.GatherPoint.backend.Model.*;
import com.GatherPoint.backend.Repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepo orderRepo;
    private final ProductRepo productRepo;
    private final CustomerRepo customerRepo;
    private final RestaurantTableRepo tableRepo;
    private final UserRepo userRepo;
    private final KitchenTicketRepo kitchenTicketRepo;
    private final SimpMessagingTemplate messagingTemplate;

    private User getLoggedInUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElse(null);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order orderInput) {
        User loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // Set table if provided
        if (orderInput.getTable() != null && orderInput.getTable().getId() != null) {
            Optional<RestaurantTable> tableOpt = tableRepo.findById(orderInput.getTable().getId());
            tableOpt.ifPresent(orderInput::setTable);
        }

        // Set customer if provided
        if (orderInput.getCustomer() != null && orderInput.getCustomer().getId() != null) {
            Optional<Customer> customerOpt = customerRepo.findById(orderInput.getCustomer().getId());
            customerOpt.ifPresent(orderInput::setCustomer);
        }

        orderInput.setEmployee(loggedInUser);
        orderInput.setCreatedAt(LocalDateTime.now());
        if (orderInput.getStatus() == null) {
            orderInput.setStatus(OrderStatus.DRAFT);
        }

        if (orderInput.getOrderNumber() == null || orderInput.getOrderNumber().isEmpty()) {
            orderInput.setOrderNumber("ORD-" + System.currentTimeMillis());
        }

        // Setup bidirectional relationship for cascade save
        if (orderInput.getItems() != null) {
            for (OrderItem item : orderInput.getItems()) {
                item.setOrder(orderInput);
                if (item.getProduct() != null && item.getProduct().getId() > 0) {
                    Optional<Product> prodOpt = productRepo.findById(item.getProduct().getId());
                    prodOpt.ifPresent(item::setProduct);
                }
            }
        }

        Order savedOrder = orderRepo.save(orderInput);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        Optional<Order> opt = orderRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = opt.get();
        order.setStatus(orderDetails.getStatus());
        order.setSubtotal(orderDetails.getSubtotal());
        order.setTax(orderDetails.getTax());
        order.setDiscount(orderDetails.getDiscount());
        order.setTotal(orderDetails.getTotal());

        if (orderDetails.getCustomer() != null && orderDetails.getCustomer().getId() != null) {
            Optional<Customer> custOpt = customerRepo.findById(orderDetails.getCustomer().getId());
            custOpt.ifPresent(order::setCustomer);
        } else {
            order.setCustomer(null);
        }

        if (orderDetails.getTable() != null && orderDetails.getTable().getId() != null) {
            Optional<RestaurantTable> tabOpt = tableRepo.findById(orderDetails.getTable().getId());
            tabOpt.ifPresent(order::setTable);
        }

        // Clear existing items and insert new ones
        order.getItems().clear();
        if (orderDetails.getItems() != null) {
            for (OrderItem item : orderDetails.getItems()) {
                item.setOrder(order);
                if (item.getProduct() != null && item.getProduct().getId() > 0) {
                    Optional<Product> prodOpt = productRepo.findById(item.getProduct().getId());
                    prodOpt.ifPresent(item::setProduct);
                }
                order.getItems().add(item);
            }
        }

        Order updated = orderRepo.save(order);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        if (!orderRepo.existsById(id)) return ResponseEntity.notFound().build();
        orderRepo.deleteById(id);
        return ResponseEntity.ok("Order deleted successfully");
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendToKitchen(@PathVariable Long id) {
        Optional<Order> orderOpt = orderRepo.findById(id);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();

        // Check if ticket already exists
        // We will just create or update the stage
        KitchenTicket ticket = KitchenTicket.builder()
                .order(order)
                .orderNumber(order.getOrderNumber())
                .stage(TicketStage.TO_COOK)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        for (OrderItem orderItem : order.getItems()) {
            KitchenTicketItem ticketItem = KitchenTicketItem.builder()
                    .productName(orderItem.getProduct().getProductName())
                    .quantity(orderItem.getQuantity())
                    .completed(false)
                    .ticket(ticket)
                    .build();
            ticket.getItems().add(ticketItem);
        }

        KitchenTicket savedTicket = kitchenTicketRepo.save(ticket);

        // Broadcast to KDS via WebSocket
        messagingTemplate.convertAndSend("/topic/kitchen", (Object) Map.of(
                "event", "NEW_ORDER",
                "ticket", savedTicket
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order sent to kitchen successfully!",
                "ticket", savedTicket
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Order> opt = orderRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = opt.get();
        if (payload.containsKey("status")) {
            try {
                OrderStatus newStatus = OrderStatus.valueOf(payload.get("status"));
                order.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status");
            }
        }
        Order updated = orderRepo.save(order);
        return ResponseEntity.ok(updated);
    }

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @PostMapping("/demo")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> generateDemoOrders() {
        try {
            entityManager.createNativeQuery("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check").executeUpdate();
        } catch (Exception e) {
            // ignore if table doesn't exist or constraint doesn't exist
        }

        User defaultUser = userRepo.findAll().stream().findFirst().orElse(null);
        List<Order> demoOrders = new ArrayList<>();
        
        for (int i = 1; i <= 10; i++) {
            Order order = Order.builder()
                    .orderNumber("DEMO-ORD-" + System.currentTimeMillis() + "-" + i)
                    .status(i % 3 == 0 ? OrderStatus.COMPLETED : (i % 2 == 0 ? OrderStatus.PAID : OrderStatus.DRAFT))
                    .subtotal(BigDecimal.valueOf(100.0 * i))
                    .tax(BigDecimal.valueOf(5.0 * i))
                    .discount(BigDecimal.ZERO)
                    .total(BigDecimal.valueOf(105.0 * i))
                    .employee(defaultUser)
                    .createdAt(LocalDateTime.now().minusHours(i))
                    .items(new ArrayList<>())
                    .build();
            demoOrders.add(orderRepo.save(order));
        }
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "10 demo orders created",
                "count", demoOrders.size()
        ));
    }
}
