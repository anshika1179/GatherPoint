package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Constants.OrderStatus;
import com.GatherPoint.backend.Model.Order;
import com.GatherPoint.backend.Model.Payment;
import com.GatherPoint.backend.Repo.OrderRepo;
import com.GatherPoint.backend.Repo.PaymentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @PostMapping("/cash")
    public ResponseEntity<?> payCash(@RequestBody Map<String, Object> payload) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        BigDecimal amountPaid = new BigDecimal(payload.get("amountPaid").toString());
        BigDecimal change = new BigDecimal(payload.get("change").toString());

        Optional<Order> orderOpt = orderRepo.findById(orderId);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        order.setStatus(OrderStatus.PAID);
        orderRepo.save(order);

        Payment payment = Payment.builder()
                .amount(amount)
                .method("CASH")
                .transactionRef("CASH-REF-" + System.currentTimeMillis())
                .createdAt(LocalDateTime.now())
                .order(order)
                .build();

        Payment saved = paymentRepo.save(payment);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "payment", saved,
                "change", change
        ));
    }

    @PostMapping("/card")
    public ResponseEntity<?> payCard(@RequestBody Map<String, Object> payload) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String transactionRef = payload.get("transactionReference").toString();

        Optional<Order> orderOpt = orderRepo.findById(orderId);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        order.setStatus(OrderStatus.PAID);
        orderRepo.save(order);

        Payment payment = Payment.builder()
                .amount(amount)
                .method("CARD")
                .transactionRef(transactionRef)
                .createdAt(LocalDateTime.now())
                .order(order)
                .build();

        Payment saved = paymentRepo.save(payment);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "payment", saved
        ));
    }

    @PostMapping("/upi")
    public ResponseEntity<?> payUpi(@RequestBody Map<String, Object> payload) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String transactionRef = payload.containsKey("transactionReference") ? payload.get("transactionReference").toString() : "UPI-" + System.currentTimeMillis();

        Optional<Order> orderOpt = orderRepo.findById(orderId);
        if (orderOpt.isEmpty()) return ResponseEntity.notFound().build();

        Order order = orderOpt.get();
        order.setStatus(OrderStatus.PAID);
        orderRepo.save(order);

        Payment payment = Payment.builder()
                .amount(amount)
                .method("UPI")
                .transactionRef(transactionRef)
                .createdAt(LocalDateTime.now())
                .order(order)
                .build();

        Payment saved = paymentRepo.save(payment);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "payment", saved
        ));
    }
}
