package com.GatherPoint.backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/razorpay")
public class RazorpayController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /**
     * Creates a Razorpay order for the given amount (in INR, converted to paise).
     * Called BEFORE launching the Razorpay checkout widget on the frontend.
     *
     * Request body: { "amount": 525.00, "currency": "INR", "receipt": "order_receipt_123" }
     * Response:     { "id": "order_xxx", "currency": "INR", "amount": 52500, "keyId": "rzp_test_..." }
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            double amountInRupees = Double.parseDouble(body.get("amount").toString());
            long amountInPaise = Math.round(amountInRupees * 100); // Razorpay uses smallest currency unit
            String currency = body.getOrDefault("currency", "INR").toString();
            String receipt = body.getOrDefault("receipt", "receipt_" + System.currentTimeMillis()).toString();

            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", currency);
            options.put("receipt", receipt);

            Order order = client.orders.create(options);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", order.get("id"));
            response.put("currency", order.get("currency"));
            response.put("amount", order.get("amount"));
            response.put("keyId", keyId);

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create Razorpay order: " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Unexpected error: " + e.getMessage()
            ));
        }
    }

    /**
     * Verifies the Razorpay payment signature after successful payment.
     * Called after the Razorpay checkout popup closes with success.
     *
     * Request body: { "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
     * Response:     { "verified": true } or { "verified": false }
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body) {
        try {
            String orderId   = body.get("razorpay_order_id");
            String paymentId = body.get("razorpay_payment_id");
            String signature = body.get("razorpay_signature");

            if (orderId == null || paymentId == null || signature == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "verified", false,
                        "error", "Missing required fields"
                ));
            }

            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(attributes, keySecret);

            return ResponseEntity.ok(Map.of("verified", isValid));
        } catch (RazorpayException e) {
            return ResponseEntity.status(400).body(Map.of(
                    "verified", false,
                    "error", "Signature verification failed: " + e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "verified", false,
                    "error", "Unexpected error: " + e.getMessage()
            ));
        }
    }
}
