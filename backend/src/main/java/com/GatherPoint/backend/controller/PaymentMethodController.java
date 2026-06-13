package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Service.PaymentMethodService;
import com.GatherPoint.backend.dto.Request.PaymentMethodRequest;
import com.GatherPoint.backend.dto.Response.PaymentMethodResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    public List<PaymentMethodResponse> getAll() {
        return paymentMethodService.getAll();
    }

    @GetMapping("/enabled")
    public List<PaymentMethodResponse> getEnabled() {
        return paymentMethodService.getEnabled();
    }

    @PostMapping
    public ResponseEntity<PaymentMethodResponse> create(@RequestBody PaymentMethodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentMethodService.create(request));
    }

    @PutMapping("/{id}")
    public PaymentMethodResponse update(@PathVariable Long id, @RequestBody PaymentMethodRequest request) {
        return paymentMethodService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentMethodService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
