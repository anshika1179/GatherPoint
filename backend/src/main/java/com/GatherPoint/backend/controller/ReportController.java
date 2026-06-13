package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Constants.OrderStatus;
import com.GatherPoint.backend.Model.Order;
import com.GatherPoint.backend.Model.OrderItem;
import com.GatherPoint.backend.Repo.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private OrderRepo orderRepo;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        List<Order> allOrders = orderRepo.findAll();
        List<Order> paidOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = paidOrders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrdersCount = allOrders.size();
        long paidOrdersCount = paidOrders.size();

        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (paidOrdersCount > 0) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(paidOrdersCount), 2, RoundingMode.HALF_UP);
        }

        // Top Selling Products
        Map<String, Integer> productQuantities = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();
        for (Order o : paidOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null) {
                        String name = item.getProduct().getProductName();
                        productQuantities.put(name, productQuantities.getOrDefault(name, 0) + item.getQuantity());
                        productRevenue.put(name, productRevenue.getOrDefault(name, BigDecimal.ZERO).add(item.getTotalPrice()));
                    }
                }
            }
        }

        List<Map<String, Object>> topProducts = productQuantities.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("quantity", entry.getValue());
                    map.put("revenue", productRevenue.get(entry.getKey()));
                    return map;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("quantity"), (Integer) a.get("quantity")))
                .limit(5)
                .collect(Collectors.toList());

        // Top Selling Categories
        Map<String, BigDecimal> categoryRevenue = new HashMap<>();
        for (Order o : paidOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                        String catName = item.getProduct().getCategory().getName();
                        categoryRevenue.put(catName, categoryRevenue.getOrDefault(catName, BigDecimal.ZERO).add(item.getTotalPrice()));
                    }
                }
            }
        }

        List<Map<String, Object>> topCategories = categoryRevenue.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("revenue", entry.getValue());
                    return map;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")))
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "totalOrders", totalOrdersCount,
                "paidOrders", paidOrdersCount,
                "totalRevenue", totalRevenue,
                "averageOrderValue", averageOrderValue,
                "topProducts", topProducts,
                "topCategories", topCategories
        ));
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport() {
        List<Order> paidOrders = orderRepo.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = paidOrders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
                "revenue", totalRevenue,
                "timestamp", LocalDateTime.now()
        ));
    }

    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProductsReport() {
        return getDashboardStats(); // reused dashboard stats containing top products
    }

    @GetMapping("/top-categories")
    public ResponseEntity<?> getTopCategoriesReport() {
        return getDashboardStats(); // reused dashboard stats containing top categories
    }

    @GetMapping("/orders")
    public List<Order> getOrdersReport() {
        return orderRepo.findAll();
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        String report = "GatherPoint POS - Sales Summary Report\n" +
                "====================================\n" +
                "Generated: " + LocalDateTime.now() + "\n\n" +
                "Total Revenue: $" + getRevenueAmount() + "\n" +
                "Total Orders: " + orderRepo.count() + "\n\n" +
                "Thank you for using GatherPoint POS system.";

        byte[] pdfBytes = report.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/export/xls")
    public ResponseEntity<byte[]> exportXls() {
        String csv = "Date,Total Orders,Revenue\n" +
                LocalDateTime.now() + "," + orderRepo.count() + "," + getRevenueAmount() + "\n";

        byte[] xlsBytes = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales_report.csv")
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(xlsBytes);
    }

    private BigDecimal getRevenueAmount() {
        return orderRepo.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
