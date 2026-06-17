package com.GatherPoint.backend.controller;

import com.GatherPoint.backend.Constants.OrderStatus;
import com.GatherPoint.backend.Constants.Role;
import com.GatherPoint.backend.Constants.DiscountType;
import com.GatherPoint.backend.Constants.PromotionScope;
import com.GatherPoint.backend.Model.*;
import com.GatherPoint.backend.Repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/public/reports")
@RequiredArgsConstructor
public class SeedController {

    private final CategoryRepo categoryRepo;
    private final ProductRepo productRepo;
    private final FloorRepo floorRepo;
    private final RestaurantTableRepo tableRepo;
    private final OrderRepo orderRepo;
    private final PaymentRepo paymentRepo;
    private final CouponRepo couponRepo;
    private final UserRepo userRepo;
    private final BookingRepo bookingRepo;
    private final KitchenTicketRepo kitchenTicketRepo;
    private final PaymentMethodRepo paymentMethodRepo;
    private final PromotionRepo promotionRepo;
    private final CustomerRepo customerRepo;

    @PostMapping("/seed")
    public ResponseEntity<?> seedDemoData() {
        try {
            // 1. Clear existing transactional/dynamic data (to avoid constraints issues)
            paymentRepo.deleteAll();
            bookingRepo.deleteAll();
            kitchenTicketRepo.deleteAll();
            orderRepo.deleteAll();
            customerRepo.deleteAll();
            tableRepo.deleteAll();
            floorRepo.deleteAll();
            promotionRepo.deleteAll();
            productRepo.deleteAll();
            categoryRepo.deleteAll();
            paymentMethodRepo.deleteAll();

            // 2. Seed Categories
            Category coffee = Category.builder().name("Coffee").color("#8B5A2B").build();
            Category tea = Category.builder().name("Tea").color("#4E8B69").build();
            Category bakery = Category.builder().name("Bakery").color("#CD853F").build();
            Category desserts = Category.builder().name("Desserts").color("#D2691E").build();
            coffee = categoryRepo.save(coffee);
            tea = categoryRepo.save(tea);
            bakery = categoryRepo.save(bakery);
            desserts = categoryRepo.save(desserts);

            // 3. Seed Products
            List<Product> products = new ArrayList<>();
            products.add(Product.builder().productName("Espresso").price(BigDecimal.valueOf(120)).uom("cup").tax(BigDecimal.valueOf(5)).description("Rich, concentrated espresso shot.").imageUrl("https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&auto=format&fit=crop").available(true).category(coffee).build());
            products.add(Product.builder().productName("Cappuccino").price(BigDecimal.valueOf(180)).uom("cup").tax(BigDecimal.valueOf(5)).description("Espresso with steamed milk and thick foam.").imageUrl("https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?q=80&w=400&auto=format&fit=crop").available(true).category(coffee).build());
            products.add(Product.builder().productName("Café Latte").price(BigDecimal.valueOf(190)).uom("cup").tax(BigDecimal.valueOf(5)).description("Smooth espresso with velvety steamed milk.").imageUrl("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop").available(true).category(coffee).build());
            products.add(Product.builder().productName("Iced Americano").price(BigDecimal.valueOf(150)).uom("cup").tax(BigDecimal.valueOf(5)).description("Bold espresso over ice and cold water.").imageUrl("https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop").available(true).category(coffee).build());
            
            products.add(Product.builder().productName("Masala Chai").price(BigDecimal.valueOf(90)).uom("cup").tax(BigDecimal.valueOf(5)).description("Aromatic tea brewed with milk and spices.").imageUrl("https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=400&auto=format&fit=crop").available(true).category(tea).build());
            products.add(Product.builder().productName("Green Tea").price(BigDecimal.valueOf(110)).uom("cup").tax(BigDecimal.valueOf(5)).description("Organic steamed green tea leaves.").imageUrl("https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=400&auto=format&fit=crop").available(true).category(tea).build());
            products.add(Product.builder().productName("Chamomile Tea").price(BigDecimal.valueOf(130)).uom("cup").tax(BigDecimal.valueOf(5)).description("Herbal tea made from chamomile flowers.").imageUrl("https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?q=80&w=400&auto=format&fit=crop").available(true).category(tea).build());

            products.add(Product.builder().productName("Butter Croissant").price(BigDecimal.valueOf(140)).uom("pcs").tax(BigDecimal.valueOf(5)).description("Flaky, buttery French croissant.").imageUrl("https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop").available(true).category(bakery).build());
            products.add(Product.builder().productName("Cinnamon Roll").price(BigDecimal.valueOf(160)).uom("pcs").tax(BigDecimal.valueOf(5)).description("Warm cinnamon spice glazed pastry.").imageUrl("https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=400&auto=format&fit=crop").available(true).category(bakery).build());
            products.add(Product.builder().productName("Blueberry Muffin").price(BigDecimal.valueOf(150)).uom("pcs").tax(BigDecimal.valueOf(5)).description("Soft muffin loaded with fresh blueberries.").imageUrl("https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=400&auto=format&fit=crop").available(true).category(bakery).build());

            products.add(Product.builder().productName("Chocolate Lava Cake").price(BigDecimal.valueOf(220)).uom("pcs").tax(BigDecimal.valueOf(5)).description("Warm cake with a molten chocolate center.").imageUrl("https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=400&auto=format&fit=crop").available(true).category(desserts).build());
            products.add(Product.builder().productName("Tiramisu").price(BigDecimal.valueOf(240)).uom("pcs").tax(BigDecimal.valueOf(5)).description("Espresso-soaked ladyfingers and mascarpone.").imageUrl("https://images.unsplash.com/photo-1571115177098-24edf7fb66ff?q=80&w=400&auto=format&fit=crop").available(true).category(desserts).build());
            products.add(Product.builder().productName("Classic Cheesecake").price(BigDecimal.valueOf(250)).uom("pcs").tax(BigDecimal.valueOf(5)).description("Rich cream cheese on graham crust.").imageUrl("https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop").available(true).category(desserts).build());

            for (int i = 0; i < products.size(); i++) {
                products.set(i, productRepo.save(products.get(i)));
            }

            // 4. Seed Floors
            Floor ground = Floor.builder().name("Ground Floor").build();
            Floor terrace = Floor.builder().name("Terrace Garden").build();
            ground = floorRepo.save(ground);
            terrace = floorRepo.save(terrace);

            // 5. Seed Tables
            List<RestaurantTable> tables = new ArrayList<>();
            tables.add(RestaurantTable.builder().tableNumber("T1").seats(2).active(true).floor(ground).build());
            tables.add(RestaurantTable.builder().tableNumber("T2").seats(4).active(true).floor(ground).build());
            tables.add(RestaurantTable.builder().tableNumber("T3").seats(4).active(true).floor(ground).build());
            tables.add(RestaurantTable.builder().tableNumber("T4").seats(6).active(true).floor(ground).build());

            tables.add(RestaurantTable.builder().tableNumber("T5").seats(2).active(true).floor(terrace).build());
            tables.add(RestaurantTable.builder().tableNumber("T6").seats(4).active(true).floor(terrace).build());
            tables.add(RestaurantTable.builder().tableNumber("T7").seats(4).active(true).floor(terrace).build());

            for (int i = 0; i < tables.size(); i++) {
                tables.set(i, tableRepo.save(tables.get(i)));
            }

            // 6. Seed Coupons
            couponRepo.save(Coupon.builder().code("WELCOME10").discountType(DiscountType.PERCENTAGE).discountValue(BigDecimal.valueOf(10)).active(true).build());
            couponRepo.save(Coupon.builder().code("CAFE50").discountType(DiscountType.FIXED_AMOUNT).discountValue(BigDecimal.valueOf(50)).active(true).build());

            // 6b. Seed Payment Methods
            paymentMethodRepo.save(PaymentMethod.builder().name("Cash").enabled(true).build());
            paymentMethodRepo.save(PaymentMethod.builder().name("Card").enabled(true).build());
            paymentMethodRepo.save(PaymentMethod.builder().name("UPI").enabled(true).upiId("cafe@ybl").build());

            // 6c. Seed Promotions
            Product cappuccino = products.stream()
                    .filter(p -> p.getProductName().equals("Cappuccino"))
                    .findFirst()
                    .orElse(null);
            if (cappuccino != null) {
                promotionRepo.save(Promotion.builder()
                        .name("Cappuccino Multi-Buy (15% Off)")
                        .discountType(DiscountType.PERCENTAGE)
                        .discountValue(BigDecimal.valueOf(15))
                        .scope(PromotionScope.PRODUCT_LEVEL)
                        .minQuantity(2)
                        .active(true)
                        .product(cappuccino)
                        .build());
            }

            promotionRepo.save(Promotion.builder()
                    .name("Large Order Discount (10% Off)")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.valueOf(10))
                    .scope(PromotionScope.ORDER_LEVEL)
                    .minOrderAmount(BigDecimal.valueOf(500))
                    .active(true)
                    .build());

            // 7. Get or Create Employee User for assigning orders
            User employee = userRepo.findAll().stream()
                    .filter(u -> u.getRole() == Role.EMPLOYEE)
                    .findFirst()
                    .orElse(null);

            if (employee == null) {
                employee = User.builder()
                        .name("Demo Staff")
                        .email("staff@gatherpoint.com")
                        .password("password")
                        .role(Role.EMPLOYEE)
                        .active(true)
                        .build();
                employee = userRepo.save(employee);
            }

            // 7a. Ensure admin user satyamkrsingh6203@gmail.com exists
            boolean adminExists = userRepo.findAll().stream()
                    .anyMatch(u -> "satyamkrsingh6203@gmail.com".equals(u.getEmail()));
            if (!adminExists) {
                userRepo.save(User.builder()
                        .name("Satyam Singh")
                        .email("satyamkrsingh6203@gmail.com")
                        .password("password")
                        .role(Role.ADMIN)
                        .active(true)
                        .build());
            }

            // 7b. Seed Customers
            List<Customer> customers = new ArrayList<>();
            customers.add(Customer.builder().name("Arjun Mehta").email("arjun.mehta@gmail.com").phone("+919876543210").build());
            customers.add(Customer.builder().name("Priya Sharma").email("priya.sharma@yahoo.com").phone("+918765432109").build());
            customers.add(Customer.builder().name("Rohan Das").email("rohan.das@outlook.com").phone("+917654321098").build());
            customers.add(Customer.builder().name("Anjali Gupta").email("anjali.gupta@gmail.com").phone("+919988776655").build());
            customers.add(Customer.builder().name("Vikram Singh").email("vikram.singh@gmail.com").phone("+918877665544").build());

            for (int i = 0; i < customers.size(); i++) {
                customers.set(i, customerRepo.save(customers.get(i)));
            }

            // 7c. Seed Bookings
            bookingRepo.save(Booking.builder()
                    .customerName("Amit Sharma")
                    .customerEmail("amit.sharma@gmail.com")
                    .customerPhone("+919911223344")
                    .bookingTime(LocalDateTime.now().plusDays(1).withHour(18).withMinute(0))
                    .guestCount(4)
                    .notes("Window table preferred.")
                    .table(tables.get(0))
                    .status("CONFIRMED")
                    .createdAt(LocalDateTime.now())
                    .build());

            bookingRepo.save(Booking.builder()
                    .customerName("Neha Patel")
                    .customerEmail("neha.patel@gmail.com")
                    .customerPhone("+919922334455")
                    .bookingTime(LocalDateTime.now().plusDays(2).withHour(20).withMinute(30))
                    .guestCount(2)
                    .notes("Anniversary dinner.")
                    .table(tables.get(4))
                    .status("CONFIRMED")
                    .createdAt(LocalDateTime.now())
                    .build());

            // 8. Seed 25 orders over the last 7 days to populate Sales Trend
            Random random = new Random();
            LocalDateTime now = LocalDateTime.now();

            for (int i = 0; i < 25; i++) {
                int dayOffset = random.nextInt(7);
                LocalDateTime orderTime = now.minusDays(dayOffset).minusHours(random.nextInt(8)).minusMinutes(random.nextInt(60));

                List<OrderItem> items = new ArrayList<>();
                int itemCount = random.nextInt(3) + 1;
                BigDecimal subtotal = BigDecimal.ZERO;

                Customer orderCustomer = null;
                if (random.nextDouble() < 0.7) {
                    orderCustomer = customers.get(random.nextInt(customers.size()));
                }

                Order order = Order.builder()
                        .orderNumber("ORD-" + (1000 + i))
                        .status(OrderStatus.PAID)
                        .employee(employee)
                        .customer(orderCustomer)
                        .table(tables.get(random.nextInt(tables.size())))
                        .createdAt(orderTime)
                        .build();

                for (int j = 0; j < itemCount; j++) {
                    Product p = products.get(random.nextInt(products.size()));
                    int qty = random.nextInt(2) + 1;
                    BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(qty));
                    subtotal = subtotal.add(lineTotal);

                    items.add(OrderItem.builder()
                            .product(p)
                            .quantity(qty)
                            .unitPrice(p.getPrice())
                            .totalPrice(lineTotal)
                            .order(order)
                            .build());
                }

                BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05));
                BigDecimal discount = BigDecimal.ZERO;
                if (subtotal.compareTo(BigDecimal.valueOf(300)) > 0) {
                    discount = BigDecimal.valueOf(50);
                }
                BigDecimal total = subtotal.add(tax).subtract(discount);

                order.setSubtotal(subtotal);
                order.setTax(tax);
                order.setDiscount(discount);
                order.setTotal(total);
                order.setItems(items);

                Order savedOrder = orderRepo.save(order);

                paymentRepo.save(Payment.builder()
                        .amount(total)
                        .method(random.nextBoolean() ? "Card" : "UPI")
                        .transactionRef("TXN-" + System.currentTimeMillis() + i)
                        .createdAt(orderTime)
                        .order(savedOrder)
                        .build());

                if (i < 15) {
                    com.GatherPoint.backend.Constants.TicketStage stage = 
                        (i % 3 == 0) ? com.GatherPoint.backend.Constants.TicketStage.COMPLETED : 
                        (i % 2 == 0 ? com.GatherPoint.backend.Constants.TicketStage.PREPARING : com.GatherPoint.backend.Constants.TicketStage.TO_COOK);
                    
                    KitchenTicket ticket = KitchenTicket.builder()
                            .order(savedOrder)
                            .orderNumber(savedOrder.getOrderNumber())
                            .stage(stage)
                            .createdAt(orderTime)
                            .items(new ArrayList<>())
                            .build();

                    for (OrderItem orderItem : items) {
                        KitchenTicketItem ticketItem = KitchenTicketItem.builder()
                                .productName(orderItem.getProduct().getProductName())
                                .quantity(orderItem.getQuantity())
                                .completed(stage == com.GatherPoint.backend.Constants.TicketStage.COMPLETED)
                                .ticket(ticket)
                                .build();
                        ticket.getItems().add(ticketItem);
                    }
                    kitchenTicketRepo.save(ticket);
                }
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Demo data seeded successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
