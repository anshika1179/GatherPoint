package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Constants.OrderStatus;
import com.GatherPoint.backend.Model.Order;
import com.GatherPoint.backend.Model.OrderItem;
import com.GatherPoint.backend.Repo.OrderRepo;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ReportController {

    private final OrderRepo orderRepo;

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

    @GetMapping("/filtered")
    public ResponseEntity<?> getFilteredReport(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long sessionId,
            @RequestParam(required = false) Long productId) {

        List<Order> allOrders = orderRepo.findAll();
        List<Order> paidOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .collect(Collectors.toList());

        // Filter by period
        LocalDateTime now = LocalDateTime.now();
        if (period != null) {
            LocalDateTime start = switch (period.toLowerCase()) {
                case "today" -> now.toLocalDate().atStartOfDay();
                case "week" -> now.toLocalDate().atStartOfDay().minusDays(now.getDayOfWeek().getValue() - 1);
                case "month" -> now.toLocalDate().atStartOfDay().withDayOfMonth(1);
                default -> null;
            };
            if (start != null) {
                paidOrders = paidOrders.stream()
                        .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(start))
                        .collect(Collectors.toList());
            }
        }

        // Filter by employee
        if (employeeId != null) {
            paidOrders = paidOrders.stream()
                    .filter(o -> o.getEmployee() != null && o.getEmployee().getId() == employeeId)
                    .collect(Collectors.toList());
        }

        // Filter by product
        if (productId != null) {
            paidOrders = paidOrders.stream()
                    .filter(o -> o.getItems() != null && o.getItems().stream()
                            .anyMatch(item -> item.getProduct() != null && item.getProduct().getId() == productId))
                    .collect(Collectors.toList());
        }

        // Calculate metrics
        BigDecimal totalRevenue = paidOrders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = paidOrders.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(paidOrders.size()), 2, RoundingMode.HALF_UP);

        // Top products
        Map<String, Object[]> productStats = new HashMap<>();
        for (Order o : paidOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null) {
                        String name = item.getProduct().getProductName();
                        productStats.putIfAbsent(name, new Object[]{0, BigDecimal.ZERO});
                        productStats.get(name)[0] = (int) productStats.get(name)[0] + item.getQuantity();
                        productStats.get(name)[1] = ((BigDecimal) productStats.get(name)[1]).add(item.getTotalPrice());
                    }
                }
            }
        }

        List<Map<String, Object>> topProducts = productStats.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("quantity", e.getValue()[0]);
                    m.put("revenue", e.getValue()[1]);
                    return m;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("quantity"), (Integer) a.get("quantity")))
                .limit(10)
                .collect(Collectors.toList());

        // Top categories
        Map<String, BigDecimal> catRevenue = new HashMap<>();
        for (Order o : paidOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null && item.getProduct().getCategory() != null) {
                        String cat = item.getProduct().getCategory().getName();
                        catRevenue.merge(cat, item.getTotalPrice(), BigDecimal::add);
                    }
                }
            }
        }

        List<Map<String, Object>> topCategories = catRevenue.entrySet().stream()
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("revenue", e.getValue());
                    return m;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")))
                .limit(5)
                .collect(Collectors.toList());

        // Top orders
        List<Map<String, Object>> topOrders = paidOrders.stream()
                .sorted((a, b) -> b.getTotal().compareTo(a.getTotal()))
                .limit(10)
                .map(o -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", o.getId());
                    m.put("orderNumber", o.getOrderNumber());
                    m.put("total", o.getTotal());
                    m.put("employee", o.getEmployee() != null ? o.getEmployee().getName() : "N/A");
                    m.put("createdAt", o.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());

        // Sales trend (last 7 days)
        List<Map<String, Object>> salesTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = now.toLocalDate().atStartOfDay().minusDays(i);
            LocalDateTime dayEnd = dayStart.plusDays(1);
            final int dayIdx = i;
            BigDecimal dayRevenue = paidOrders.stream()
                    .filter(o -> o.getCreatedAt() != null
                            && o.getCreatedAt().isAfter(dayStart)
                            && o.getCreatedAt().isBefore(dayEnd))
                    .map(Order::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long dayOrderCount = paidOrders.stream()
                    .filter(o -> o.getCreatedAt() != null
                            && o.getCreatedAt().isAfter(dayStart)
                            && o.getCreatedAt().isBefore(dayEnd))
                    .count();
            Map<String, Object> day = new HashMap<>();
            day.put("date", dayStart.toLocalDate().toString());
            day.put("revenue", dayRevenue);
            day.put("orderCount", dayOrderCount);
            salesTrend.add(day);
        }

        return ResponseEntity.ok(Map.of(
                "totalOrders", paidOrders.size(),
                "totalRevenue", totalRevenue,
                "averageOrderValue", averageOrderValue,
                "topProducts", topProducts,
                "topCategories", topCategories,
                "topOrders", topOrders,
                "salesTrend", salesTrend
        ));
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
