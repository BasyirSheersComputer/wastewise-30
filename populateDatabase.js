// populateDatabase.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Key. Check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Realistic restaurant data - matching actual database schema
const suppliers = [
  { name: 'Fresh Harvest Produce', category: 'Produce', status: 'active', contact: '+1 (555) 123-4567', email: 'orders@freshharvest.com', address: '123 Market St, City, State 12345', rating: 4.8, last_delivery: '2024-01-16', total_orders: 145 },
  { name: 'Prime Cuts Meats', category: 'Meat & Poultry', status: 'active', contact: '+1 (555) 234-5678', email: 'sales@primecuts.com', address: '456 Industrial Blvd, City, State 12345', rating: 4.6, last_delivery: '2024-01-15', total_orders: 89 },
  { name: 'Dairy Delights', category: 'Dairy', status: 'active', contact: '+1 (555) 345-6789', email: 'orders@dairydelights.com', address: '789 Dairy Lane, City, State 12345', rating: 4.3, last_delivery: '2024-01-14', total_orders: 67 },
  { name: 'Ocean Fresh Seafood', category: 'Seafood', status: 'active', contact: '+1 (555) 456-7890', email: 'orders@oceanfresh.com', address: '321 Harbor Dr, City, State 12345', rating: 4.7, last_delivery: '2024-01-16', total_orders: 92 },
  { name: 'Gourmet Pantry', category: 'Pantry', status: 'active', contact: '+1 (555) 567-8901', email: 'orders@gourmetpantry.com', address: '654 Gourmet Ave, City, State 12345', rating: 4.5, last_delivery: '2024-01-12', total_orders: 78 },
  { name: 'Artisan Bakery', category: 'Bakery', status: 'active', contact: '+1 (555) 678-9012', email: 'orders@artisanbakery.com', address: '987 Baker St, City, State 12345', rating: 4.4, last_delivery: '2024-01-16', total_orders: 156 },
  { name: 'Organic Valley', category: 'Organic', status: 'active', contact: '+1 (555) 789-0123', email: 'orders@organicvalley.com', address: '147 Organic Way, City, State 12345', rating: 4.9, last_delivery: '2024-01-15', total_orders: 203 },
  { name: 'Spice World', category: 'Spices & Herbs', status: 'active', contact: '+1 (555) 890-1234', email: 'orders@spiceworld.com', address: '258 Spice Rd, City, State 12345', rating: 4.2, last_delivery: '2024-01-14', total_orders: 45 }
]

const staff = [
  { name: 'John Smith', role: 'Head Chef', status: 'active', email: 'john.smith@restaurant.com', phone: '+1 (555) 111-1111' },
  { name: 'Sarah Johnson', role: 'Sous Chef', status: 'active', email: 'sarah.johnson@restaurant.com', phone: '+1 (555) 222-2222' },
  { name: 'Mike Davis', role: 'Kitchen Manager', status: 'active', email: 'mike.davis@restaurant.com', phone: '+1 (555) 333-3333' },
  { name: 'Emily Wilson', role: 'Server', status: 'active', email: 'emily.wilson@restaurant.com', phone: '+1 (555) 444-4444' },
  { name: 'David Brown', role: 'Bartender', status: 'active', email: 'david.brown@restaurant.com', phone: '+1 (555) 555-5555' },
  { name: 'Lisa Garcia', role: 'Hostess', status: 'active', email: 'lisa.garcia@restaurant.com', phone: '+1 (555) 666-6666' },
  { name: 'Tom Anderson', role: 'Dishwasher', status: 'active', email: 'tom.anderson@restaurant.com', phone: '+1 (555) 777-7777' },
  { name: 'Rachel Lee', role: 'Prep Cook', status: 'active', email: 'rachel.lee@restaurant.com', phone: '+1 (555) 888-8888' }
]

const inventoryItems = [
  { name: 'Tomatoes', category: 'Produce', current_stock: 45, min_stock: 50, max_stock: 200, unit: 'kg', cost: 2.50, supplier_id: null, status: 'low', last_restock: '2024-01-15' },
  { name: 'Lettuce', category: 'Produce', current_stock: 25, min_stock: 30, max_stock: 150, unit: 'kg', cost: 1.80, supplier_id: null, status: 'low', last_restock: '2024-01-16' },
  { name: 'Onions', category: 'Produce', current_stock: 80, min_stock: 40, max_stock: 200, unit: 'kg', cost: 1.20, supplier_id: null, status: 'good', last_restock: '2024-01-14' },
  { name: 'Chicken Breast', category: 'Meat', current_stock: 125, min_stock: 80, max_stock: 300, unit: 'kg', cost: 8.90, supplier_id: null, status: 'good', last_restock: '2024-01-14' },
  { name: 'Ground Beef', category: 'Meat', current_stock: 95, min_stock: 60, max_stock: 250, unit: 'kg', cost: 12.50, supplier_id: null, status: 'good', last_restock: '2024-01-15' },
  { name: 'Salmon Fillet', category: 'Seafood', current_stock: 75, min_stock: 50, max_stock: 200, unit: 'kg', cost: 22.00, supplier_id: null, status: 'good', last_restock: '2024-01-16' },
  { name: 'Mozzarella Cheese', category: 'Dairy', current_stock: 15, min_stock: 20, max_stock: 80, unit: 'kg', cost: 12.50, supplier_id: null, status: 'low', last_restock: '2024-01-13' },
  { name: 'Heavy Cream', category: 'Dairy', current_stock: 35, min_stock: 25, max_stock: 100, unit: 'L', cost: 8.00, supplier_id: null, status: 'good', last_restock: '2024-01-15' },
  { name: 'Olive Oil', category: 'Pantry', current_stock: 35, min_stock: 25, max_stock: 100, unit: 'L', cost: 15.00, supplier_id: null, status: 'good', last_restock: '2024-01-12' },
  { name: 'Flour', category: 'Pantry', current_stock: 120, min_stock: 50, max_stock: 300, unit: 'kg', cost: 2.00, supplier_id: null, status: 'good', last_restock: '2024-01-10' },
  { name: 'Fresh Basil', category: 'Herbs', current_stock: 8, min_stock: 10, max_stock: 50, unit: 'kg', cost: 25.00, supplier_id: null, status: 'low', last_restock: '2024-01-16' },
  { name: 'Garlic', category: 'Produce', current_stock: 60, min_stock: 30, max_stock: 150, unit: 'kg', cost: 3.50, supplier_id: null, status: 'good', last_restock: '2024-01-14' },
  { name: 'Bread Rolls', category: 'Bakery', current_stock: 200, min_stock: 100, max_stock: 500, unit: 'pieces', cost: 0.50, supplier_id: null, status: 'good', last_restock: '2024-01-16' },
  { name: 'Butter', category: 'Dairy', current_stock: 45, min_stock: 30, max_stock: 120, unit: 'kg', cost: 6.50, supplier_id: null, status: 'good', last_restock: '2024-01-15' },
  { name: 'Pasta', category: 'Pantry', current_stock: 85, min_stock: 40, max_stock: 200, unit: 'kg', cost: 3.20, supplier_id: null, status: 'good', last_restock: '2024-01-13' }
]

const wasteLogs = [
  { item_id: null, quantity: 3.2, unit: 'kg', cost: 8.50, reason: 'Spoilage', staff_id: null, date: '2024-01-16' },
  { item_id: null, quantity: 24, unit: 'pieces', cost: 12.00, reason: 'End of day', staff_id: null, date: '2024-01-16' },
  { item_id: null, quantity: 1.5, unit: 'kg', cost: 15.75, reason: 'Expired', staff_id: null, date: '2024-01-15' },
  { item_id: null, quantity: 2.8, unit: 'kg', cost: 7.20, reason: 'Overripe', staff_id: null, date: '2024-01-15' },
  { item_id: null, quantity: 0.5, unit: 'kg', cost: 12.50, reason: 'Spoilage', staff_id: null, date: '2024-01-14' },
  { item_id: null, quantity: 1.0, unit: 'L', cost: 8.00, reason: 'Spillage', staff_id: null, date: '2024-01-14' },
  { item_id: null, quantity: 5, unit: 'pieces', cost: 2.50, reason: 'End of day', staff_id: null, date: '2024-01-13' },
  { item_id: null, quantity: 0.8, unit: 'kg', cost: 20.00, reason: 'Overproduction', staff_id: null, date: '2024-01-13' },
  { item_id: null, quantity: 2.0, unit: 'kg', cost: 17.80, reason: 'Expired', staff_id: null, date: '2024-01-12' },
  { item_id: null, quantity: 1.2, unit: 'kg', cost: 3.00, reason: 'Spoilage', staff_id: null, date: '2024-01-12' }
]

const supplierOrders = [
  { supplier_id: null, items: [], total: 1240.50, status: 'delivered', order_date: '2024-01-14', delivery_date: '2024-01-16', tracking: 'DEL-789456' },
  { supplier_id: null, items: [], total: 2180.00, status: 'pending', order_date: '2024-01-15', delivery_date: '2024-01-17', tracking: 'PEN-123789' },
  { supplier_id: null, items: [], total: 845.30, status: 'in-transit', order_date: '2024-01-15', delivery_date: '2024-01-17', tracking: 'TRA-456123' },
  { supplier_id: null, items: [], total: 1560.75, status: 'delivered', order_date: '2024-01-13', delivery_date: '2024-01-15', tracking: 'DEL-321654' },
  { supplier_id: null, items: [], total: 920.40, status: 'delivered', order_date: '2024-01-12', delivery_date: '2024-01-14', tracking: 'DEL-987321' },
  { supplier_id: null, items: [], total: 680.25, status: 'pending', order_date: '2024-01-16', delivery_date: '2024-01-18', tracking: 'PEN-654987' },
  { supplier_id: null, items: [], total: 1120.80, status: 'in-transit', order_date: '2024-01-16', delivery_date: '2024-01-18', tracking: 'TRA-147258' },
  { supplier_id: null, items: [], total: 450.60, status: 'delivered', order_date: '2024-01-14', delivery_date: '2024-01-16', tracking: 'DEL-369258' }
]

async function populateDatabase() {
  console.log('🚀 Starting database population...')

  try {
    // 1. Insert suppliers
    console.log('📦 Inserting suppliers...')
    const { data: supplierData, error: supplierError } = await supabase
      .from('supplier_data')
      .insert(suppliers)
      .select()
    
    if (supplierError) throw supplierError
    console.log(`✅ Inserted ${supplierData.length} suppliers`)

    // 2. Insert staff
    console.log('👥 Inserting staff...')
    const { data: staffData, error: staffError } = await supabase
      .from('user_staff_data')
      .insert(staff)
      .select()
    
    if (staffError) throw staffError
    console.log(`✅ Inserted ${staffData.length} staff members`)

    // 3. Insert inventory items (with supplier references)
    console.log('📦 Inserting inventory items...')
    const inventoryWithSuppliers = inventoryItems.map((item, index) => ({
      ...item,
      supplier_id: supplierData[index % supplierData.length].id
    }))
    
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_data')
      .insert(inventoryWithSuppliers)
      .select()
    
    if (inventoryError) throw inventoryError
    console.log(`✅ Inserted ${inventoryData.length} inventory items`)

    // 4. Insert waste logs (with item and staff references)
    console.log('🗑️ Inserting waste logs...')
    const wasteWithReferences = wasteLogs.map((waste, index) => ({
      ...waste,
      item_id: inventoryData[index % inventoryData.length].id,
      staff_id: staffData[index % staffData.length].id
    }))
    
    const { data: wasteData, error: wasteError } = await supabase
      .from('waste_logs')
      .insert(wasteWithReferences)
      .select()
    
    if (wasteError) throw wasteError
    console.log(`✅ Inserted ${wasteData.length} waste logs`)

    // 5. Insert supplier orders (with supplier references and item details)
    console.log('📋 Inserting supplier orders...')
    const ordersWithDetails = supplierOrders.map((order, index) => ({
      ...order,
      supplier_id: supplierData[index % supplierData.length].id,
      items: [
        {
          inventory_id: inventoryData[index % inventoryData.length].id,
          quantity: Math.floor(Math.random() * 50) + 10,
          unit: 'kg',
          cost: Math.floor(Math.random() * 100) + 20
        }
      ]
    }))
    
    const { data: orderData, error: orderError } = await supabase
      .from('supplier_orders')
      .insert(ordersWithDetails)
      .select()
    
    if (orderError) throw orderError
    console.log(`✅ Inserted ${orderData.length} supplier orders`)

    console.log('🎉 Database population completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Suppliers: ${supplierData.length}`)
    console.log(`   - Staff: ${staffData.length}`)
    console.log(`   - Inventory Items: ${inventoryData.length}`)
    console.log(`   - Waste Logs: ${wasteData.length}`)
    console.log(`   - Supplier Orders: ${orderData.length}`)

  } catch (error) {
    console.error('❌ Error populating database:', error)
    process.exit(1)
  }
}

// Run the population script
populateDatabase() 