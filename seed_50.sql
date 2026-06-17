-- seed_50.sql: Populate each table with 50 rows (demo data)
-- WARNING: Run this script on a clean database or after truncating tables.
-- Adjust sequences if needed.

-- 1. Categories (5 sample categories, will be reused by products)
INSERT INTO category (name, color) VALUES
('Coffee', '#8B5A2B'),
('Tea', '#4E8B69'),
('Bakery', '#CD853F'),
('Desserts', '#D2691E'),
('Snacks', '#A0522D');

-- 2. Floors (2 floors)
INSERT INTO floor (name) VALUES
('Ground Floor'),
('Terrace Garden');

-- 3. Restaurant Tables (50 tables, alternate floors)
INSERT INTO restaurant_table (table_number, seats, active, floor_id)
SELECT
  CONCAT('T', seq),
  CASE WHEN (seq % 5) = 0 THEN 6 WHEN (seq % 3) = 0 THEN 4 ELSE 2 END,
  TRUE,
  CASE WHEN (seq % 2) = 0 THEN 1 ELSE 2 END
FROM generate_series(1, 50) AS s(seq);

-- 4. Users (5 employees, 5 managers, 40 customers via Customer table later)
INSERT INTO "user" (name, email, password, role, active) VALUES
('Demo Admin', 'admin@gatherpoint.com', 'password', 'ADMIN', TRUE),
('Demo Staff', 'staff@gatherpoint.com', 'password', 'EMPLOYEE', TRUE),
('Demo Manager', 'manager@gatherpoint.com', 'password', 'MANAGER', TRUE),
('Demo Guest', 'guest@gatherpoint.com', 'password', 'GUEST', TRUE),
('Demo Support', 'support@gatherpoint.com', 'password', 'SUPPORT', TRUE);

-- 5. Coupons (5 sample coupons)
INSERT INTO coupon (code, discount_type, discount_value, active) VALUES
('WELCOME10', 'PERCENTAGE', 10, TRUE),
('CAFE50', 'FIXED_AMOUNT', 50, TRUE),
('SUMMER15', 'PERCENTAGE', 15, TRUE),
('LUNCH20', 'FIXED_AMOUNT', 20, TRUE),
('FIRST5', 'PERCENTAGE', 5, TRUE);

-- 6. Payment Methods (3 methods)
INSERT INTO payment_method (name, enabled, upi_id) VALUES
('Cash', TRUE, NULL),
('Card', TRUE, NULL),
('UPI', TRUE, 'cafe@ybl');

-- 7. Products (50 products, random categories)
INSERT INTO product (product_name, price, uom, tax, description, image_url, available, category_id)
SELECT
  CONCAT('Product ', seq),
  (10 + (seq % 20)) * 10,
  'pcs',
  5,
  CONCAT('Description for product ', seq),
  'https://via.placeholder.com/150',
  TRUE,
  (SELECT id FROM category ORDER BY random() LIMIT 1)
FROM generate_series(1, 50) AS s(seq);

-- 8. Customers (50 customers)
INSERT INTO customer (name, email, phone) SELECT
  CONCAT('Customer ', seq),
  CONCAT('customer', seq, '@example.com'),
  CONCAT('+91', LPAD((RANDOM()*10000000)::int::text, 10, '0'))
FROM generate_series(1, 50) AS s(seq);

-- 9. Bookings (50 bookings, associate random table & customer)
INSERT INTO booking (customer_name, customer_email, customer_phone, booking_time, guest_count, notes, "table_id", status, created_at)
SELECT
  c.name,
  c.email,
  c.phone,
  NOW() + INTERVAL '1 day' + (seq || ' hours')::interval,
  (seq % 6) + 1,
  'Auto‑generated booking',
  (SELECT id FROM restaurant_table ORDER BY random() LIMIT 1),
  'CONFIRMED',
  NOW()
FROM generate_series(1, 50) AS s(seq)
JOIN customer c ON c.id = (SELECT id FROM customer ORDER BY random() LIMIT 1);

-- 10. Promotions (5 promotions, some product‑level, some order‑level)
INSERT INTO promotion (name, discount_type, discount_value, scope, min_quantity, min_order_amount, active, product_id)
VALUES
('Multi‑Buy 2 (10% Off)', 'PERCENTAGE', 10, 'PRODUCT_LEVEL', 2, NULL, TRUE,
 (SELECT id FROM product WHERE product_name = 'Product 1')),
('Large Order 5% Off', 'PERCENTAGE', 5, 'ORDER_LEVEL', NULL, 500, TRUE, NULL),
('Weekend Special 15% Off', 'PERCENTAGE', 15, 'ORDER_LEVEL', NULL, 300, TRUE, NULL),
('Buy 3 Get 1 Free', 'FIXED_AMOUNT', 0, 'PRODUCT_LEVEL', 4, NULL, TRUE,
 (SELECT id FROM product WHERE product_name = 'Product 2')),
('Happy Hour 20% Off', 'PERCENTAGE', 20, 'ORDER_LEVEL', NULL, 200, TRUE, NULL);

-- 11. Orders, OrderItems, Payments, KitchenTickets are more relational; you can generate them via application seed logic.
-- For quick demo you may run the existing /api/public/reports/seed endpoint which already creates 25 orders.

-- After running this script, reset the ID sequences (PostgreSQL example):
SELECT setval(pg_get_serial_sequence('category', 'id'), (SELECT MAX(id) FROM category));
SELECT setval(pg_get_serial_sequence('floor', 'id'), (SELECT MAX(id) FROM floor));
SELECT setval(pg_get_serial_sequence('restaurant_table', 'id'), (SELECT MAX(id) FROM restaurant_table));
SELECT setval(pg_get_serial_sequence('"user"', 'id'), (SELECT MAX(id) FROM "user"));
SELECT setval(pg_get_serial_sequence('coupon', 'id'), (SELECT MAX(id) FROM coupon));
SELECT setval(pg_get_serial_sequence('payment_method', 'id'), (SELECT MAX(id) FROM payment_method));
SELECT setval(pg_get_serial_sequence('product', 'id'), (SELECT MAX(id) FROM product));
SELECT setval(pg_get_serial_sequence('customer', 'id'), (SELECT MAX(id) FROM customer));
SELECT setval(pg_get_serial_sequence('booking', 'id'), (SELECT MAX(id) FROM booking));
SELECT setval(pg_get_serial_sequence('promotion', 'id'), (SELECT MAX(id) FROM promotion));

-- End of seed_50.sql
