-- Malaysian F&B Value Chain Data Population Script
-- Run this script directly in Supabase Dashboard > SQL Editor
-- This script bypasses RLS policies by running as the service role

-- =====================================================
-- MALAYSIAN COFFEE CHAINS
-- =====================================================

INSERT INTO coffee_chains (id, user_id, chain_name, description, total_outlets, primary_location, business_type, established_date, annual_revenue_range, employee_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 'OldTown White Coffee', 'Malaysian coffee chain specializing in white coffee and local cuisine', 350, 'Petaling Jaya, Selangor, Malaysia', 'coffee_chain', '1999-01-01', 'over_5m', 5000),
('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', 'Starbucks Malaysia', 'International coffee chain with Malaysian market adaptation', 380, 'Kuala Lumpur, Malaysia', 'coffee_chain', '1998-12-01', 'over_5m', 4500),
('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000001', 'Coffee Bean & Tea Leaf Malaysia', 'Premium coffee and tea chain with local partnerships', 120, 'Kuala Lumpur, Malaysia', 'coffee_chain', '1997-06-01', '1m_5m', 1800),
('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000001', 'Gloria Jean''s Malaysia', 'Australian coffee chain with Malaysian franchise operations', 85, 'Petaling Jaya, Selangor, Malaysia', 'coffee_chain', '2000-03-01', '500k_1m', 1200),
('550e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000001', 'San Francisco Coffee Malaysia', 'Local coffee chain with artisanal coffee focus', 45, 'Kuala Lumpur, Malaysia', 'coffee_chain', '2005-08-01', '500k_1m', 600),
('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000001', 'Zus Coffee', 'Fast-growing Malaysian coffee chain with drive-thru concept', 180, 'Kuala Lumpur, Malaysia', 'coffee_chain', '2019-01-01', '1m_5m', 2200),
('550e8400-e29b-41d4-a716-446655440007', '00000000-0000-0000-0000-000000000001', 'Bask Bear Coffee', 'Local specialty coffee chain with Malaysian coffee beans', 25, 'Kuala Lumpur, Malaysia', 'coffee_chain', '2018-06-01', '100k_500k', 300),
('550e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000001', 'Kopi Kenangan', 'Indonesian coffee chain expanding in Malaysia', 65, 'Kuala Lumpur, Malaysia', 'coffee_chain', '2020-01-01', '500k_1m', 800);

-- =====================================================
-- MALAYSIAN F&B SUPPLIERS
-- =====================================================

INSERT INTO suppliers (id, user_id, supplier_name, contact_person, email, phone, address, supplier_type, risk_level, reliability_score, last_order_date, average_delivery_time, notes) VALUES
-- Coffee Bean Suppliers
('660e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 'BOH Plantations Sdn Bhd', 'Ahmad Fadzil', 'procurement@boh.com.my', '+60-3-2788-8888', 'BOH Tea Centre, 32 Jalan Mayang, Kuala Lumpur 50450', 'ingredients', 'low', 9, CURRENT_DATE - INTERVAL '2 days', 2, 'Premium Malaysian tea and coffee supplier'),
('660e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', 'MyCoffee Sdn Bhd', 'Sarah Tan', 'sales@mycoffee.com.my', '+60-3-7722-3344', 'Lot 123, Jalan Sultan, Kuala Lumpur 50000', 'ingredients', 'low', 8, CURRENT_DATE - INTERVAL '1 day', 1, 'Local coffee bean roaster and supplier'),
('660e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000001', 'Cameron Highlands Coffee Estate', 'Raj Kumar', 'info@cameroncoffee.com.my', '+60-5-491-1234', 'Cameron Highlands, Pahang 39000', 'ingredients', 'medium', 7, CURRENT_DATE - INTERVAL '3 days', 3, 'Highland coffee beans and specialty blends'),

-- Dairy Suppliers
('660e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000001', 'Dutch Lady Malaysia', 'Lim Mei Ling', 'b2b@dutchlady.com.my', '+60-3-7844-8888', 'Petaling Jaya, Selangor 47301', 'ingredients', 'low', 9, CURRENT_DATE - INTERVAL '1 day', 1, 'Fresh milk and dairy products'),
('660e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000001', 'Farm Fresh Berhad', 'Azizah Rahman', 'wholesale@farmfresh.com.my', '+60-3-8765-4321', 'Seremban, Negeri Sembilan 70400', 'ingredients', 'low', 8, CURRENT_DATE - INTERVAL '2 days', 2, 'Organic milk and dairy alternatives'),

-- Equipment Suppliers
('660e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000001', 'La Marzocco Malaysia', 'David Wong', 'malaysia@lamarzocco.com', '+60-3-2287-8080', 'Bangsar, Kuala Lumpur 59100', 'equipment', 'low', 9, CURRENT_DATE - INTERVAL '7 days', 14, 'Premium coffee machines and equipment'),
('660e8400-e29b-41d4-a716-446655440007', '00000000-0000-0000-0000-000000000001', 'Bunn Malaysia', 'Kumar Rajan', 'sales@bunn.com.my', '+60-3-7880-1122', 'Shah Alam, Selangor 40000', 'equipment', 'medium', 7, CURRENT_DATE - INTERVAL '10 days', 21, 'Commercial coffee brewers and dispensers'),

-- Packaging Suppliers
('660e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000001', 'Malaysian Packaging Industries', 'Tan Ah Kow', 'sales@mpi.com.my', '+60-3-3344-5566', 'Klang, Selangor 41000', 'packaging', 'medium', 8, CURRENT_DATE - INTERVAL '5 days', 7, 'Eco-friendly packaging solutions'),
('660e8400-e29b-41d4-a716-446655440009', '00000000-0000-0000-0000-000000000001', 'GreenPak Solutions', 'Nurul Ain', 'info@greenpak.com.my', '+60-3-4455-6677', 'Cyberjaya, Selangor 63000', 'packaging', 'low', 8, CURRENT_DATE - INTERVAL '3 days', 5, 'Biodegradable and compostable packaging'),

-- Local Food Suppliers
('660e8400-e29b-41d4-a716-446655440010', '00000000-0000-0000-0000-000000000001', 'Kampung Bakeries', 'Aminah Hassan', 'orders@kampungbakeries.com.my', '+60-3-5566-7788', 'Kajang, Selangor 43000', 'ingredients', 'medium', 7, CURRENT_DATE - INTERVAL '1 day', 1, 'Traditional Malaysian pastries and breads'),
('660e8400-e29b-41d4-a716-446655440011', '00000000-0000-0000-0000-000000000001', 'Tropical Fruits Malaysia', 'Lee Chong Wei', 'sales@tropicalfruits.com.my', '+60-3-6677-8080', 'Batu Pahat, Johor 83000', 'ingredients', 'medium', 7, CURRENT_DATE - INTERVAL '2 days', 2, 'Fresh local fruits and tropical ingredients');

-- =====================================================
-- SAMPLE OUTLETS
-- =====================================================

INSERT INTO outlets (id, chain_id, outlet_name, address, city, state, postal_code, country, phone_number, manager_name, outlet_type, seating_capacity, operating_hours, status) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'OldTown White Coffee - Mid Valley', 'G-073, Ground Floor, Mid Valley Megamall', 'Kuala Lumpur', 'Kuala Lumpur', '59200', 'Malaysia', '+60-3-2282-1234', 'Ahmad Zulkarnain', 'full_service', 80, '{"open": "08:00", "close": "22:00"}', 'active'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Starbucks - Pavilion KL', 'Lot 1.01.00, Level 1, Pavilion Kuala Lumpur', 'Kuala Lumpur', 'Kuala Lumpur', '55100', 'Malaysia', '+60-3-2148-5678', 'Sarah Lim', 'full_service', 120, '{"open": "07:00", "close": "23:00"}', 'active'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Zus Coffee - Sunway Pyramid', 'LG2.67, Lower Ground 2, Sunway Pyramid', 'Petaling Jaya', 'Selangor', '46150', 'Malaysia', '+60-3-7494-9012', 'Nurul Huda', 'kiosk', 30, '{"open": "10:00", "close": "22:00"}', 'active');

-- =====================================================
-- MALAYSIAN F&B WASTE DATA
-- =====================================================

INSERT INTO waste_data (id, user_id, outlet_id, item_name, category, quantity, unit, waste_type, cost_per_unit, total_cost, reason, recorded_by) VALUES
('880e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440001', 'White Coffee Powder', 'ingredient', 2.5, 'kg', 'expired', 45.00, 112.50, 'Exceeded shelf life - humidity issues during monsoon season', 'Ahmad Zulkarnain'),
('880e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440002', 'Fresh Milk', 'beverage', 5.0, 'L', 'expired', 8.50, 42.50, 'Power outage during peak hours - milk spoiled', 'Sarah Lim'),
('880e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440003', 'Arabica Coffee Beans', 'ingredient', 1.8, 'kg', 'overcooked', 65.00, 117.00, 'Barista training session - over-roasted beans', 'Nurul Huda'),
('880e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000001', NULL, 'Kaya Toast', 'food', 15, 'pieces', 'expired', 3.50, 52.50, 'Low customer turnout due to heavy rain', 'System'),
('880e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000001', NULL, 'Durian Cake', 'food', 8, 'pieces', 'spoiled', 12.00, 96.00, 'Temperature control failure in display case', 'System'),
('880e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000001', NULL, 'Plastic Straws', 'packaging', 500, 'pieces', 'other', 0.05, 25.00, 'Switching to biodegradable alternatives', 'System'),
('880e8400-e29b-41d4-a716-446655440007', '00000000-0000-0000-0000-000000000001', NULL, 'Teh Tarik Mix', 'ingredient', 3.2, 'kg', 'expired', 28.00, 89.60, 'Seasonal demand fluctuation', 'System'),
('880e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000001', NULL, 'Pandan Leaves', 'ingredient', 2.0, 'kg', 'spoiled', 15.00, 30.00, 'Supplier delivery delay - leaves wilted', 'System');

-- =====================================================
-- SAMPLE STAFF DATA
-- =====================================================

INSERT INTO staff (id, user_id, outlet_id, name, position, email, phone, hire_date, status, training_level) VALUES
('990e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440001', 'Ahmad Zulkarnain', 'Outlet Manager', 'ahmad.zulkarnain@oldtown.com.my', '+60-12-345-6789', '2020-03-15', 'active', 'advanced'),
('990e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440002', 'Sarah Lim', 'Store Manager', 'sarah.lim@starbucks.com.my', '+60-12-987-6543', '2019-08-20', 'active', 'expert'),
('990e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440003', 'Nurul Huda', 'Shift Supervisor', 'nurul.huda@zus.com.my', '+60-12-456-7890', '2021-01-10', 'active', 'intermediate');

-- =====================================================
-- ANALYTICS DATA
-- =====================================================

INSERT INTO analytics (id, user_id, outlet_id, data_type, data, period_start, period_end) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440001', 'waste', '{"total_waste_cost": 1250.75, "waste_by_category": {"food": 45.2, "beverage": 32.1, "packaging": 15.8, "ingredient": 6.9}, "top_waste_items": ["White Coffee Powder", "Fresh Milk", "Kaya Toast"], "waste_trend": "decreasing", "monthly_savings": 320.50}', '2024-01-01', '2024-01-31'),
('aa0e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440002', 'sales', '{"total_sales": 45000.00, "average_transaction": 28.50, "peak_hours": ["08:00-10:00", "14:00-16:00"], "top_products": ["Caramel Macchiato", "Iced Americano", "Chocolate Chip Cookie"], "customer_satisfaction": 4.6}', '2024-01-01', '2024-01-31');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check inserted data
SELECT 'Coffee Chains' as table_name, COUNT(*) as count FROM coffee_chains
UNION ALL
SELECT 'Suppliers' as table_name, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'Outlets' as table_name, COUNT(*) as count FROM outlets
UNION ALL
SELECT 'Waste Data' as table_name, COUNT(*) as count FROM waste_data
UNION ALL
SELECT 'Staff' as table_name, COUNT(*) as count FROM staff
UNION ALL
SELECT 'Analytics' as table_name, COUNT(*) as count FROM analytics;

-- Show sample Malaysian coffee chains
SELECT chain_name, total_outlets, primary_location FROM coffee_chains ORDER BY total_outlets DESC LIMIT 5;

-- Show sample Malaysian suppliers
SELECT supplier_name, supplier_type, risk_level FROM suppliers ORDER BY reliability_score DESC LIMIT 5;

-- Show sample waste data
SELECT item_name, quantity, unit, reason FROM waste_data ORDER BY total_cost DESC LIMIT 5;
