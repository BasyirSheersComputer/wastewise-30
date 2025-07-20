// supabaseTest.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config() // Load .env variables

console.log('Script started')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Key. Check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    const { data, error } = await supabase.from('supplier_data').select('*').limit(1);
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Supabase connection successful. Sample data:', data);
    }
}

testConnection().catch(e => {
  console.error('Script error:', e);
});
  
async function runTests() {
  // 1. Insert into supplier_data
  const { data: supplier, error: supplierError } = await supabase
    .from('supplier_data')
    .insert([{ name: 'Test Supplier', category: 'Produce', status: 'active' }])
    .select()
    .single();
  if (supplierError) throw supplierError;
  console.log('Inserted supplier:', supplier);

  // 2. Insert into user_staff_data
  const { data: staff, error: staffError } = await supabase
    .from('user_staff_data')
    .insert([{ name: 'Test Staff', role: 'Manager', status: 'active' }])
    .select()
    .single();
  if (staffError) throw staffError;
  console.log('Inserted staff:', staff);

  // 3. Insert into inventory_data (link to supplier)
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory_data')
    .insert([{
      name: 'Test Item',
      category: 'Produce',
      current_stock: 100,
      supplier_id: supplier.id,
      status: 'good'
    }])
    .select()
    .single();
  if (inventoryError) throw inventoryError;
  console.log('Inserted inventory:', inventory);

  // 4. Insert into waste_logs (link to inventory and staff)
  const { data: waste, error: wasteError } = await supabase
    .from('waste_logs')
    .insert([{
      item_id: inventory.id,
      quantity: 5,
      unit: 'kg',
      cost: 10,
      reason: 'Spoilage',
      staff_id: staff.id
    }])
    .select()
    .single();
  if (wasteError) throw wasteError;
  console.log('Inserted waste log:', waste);

  // 5. Insert into supplier_orders (link to supplier, items as JSON)
  const { data: order, error: orderError } = await supabase
    .from('supplier_orders')
    .insert([{
      supplier_id: supplier.id,
      items: [{ inventory_id: inventory.id, quantity: 10, unit: 'kg', cost: 20 }],
      total: 200,
      status: 'pending'
    }])
    .select()
    .single();
  if (orderError) throw orderError;
  console.log('Inserted supplier order:', order);

  // 6. Query with join: Get inventory with supplier name
  const { data: joined, error: joinError } = await supabase
    .from('inventory_data')
    .select('*, supplier_data(name)')
    .eq('id', inventory.id)
    .single();
  if (joinError) throw joinError;
  console.log('Joined inventory with supplier:', joined);

  // 7. Update test: Update inventory stock
  const { data: updated, error: updateError } = await supabase
    .from('inventory_data')
    .update({ current_stock: 90 })
    .eq('id', inventory.id)
    .select()
    .single();
  if (updateError) throw updateError;
  console.log('Updated inventory:', updated);

  // 8. Delete test: Remove test data (clean up)
  await supabase.from('waste_logs').delete().eq('id', waste.id);
  await supabase.from('supplier_orders').delete().eq('id', order.id);
  await supabase.from('inventory_data').delete().eq('id', inventory.id);
  await supabase.from('user_staff_data').delete().eq('id', staff.id);
  await supabase.from('supplier_data').delete().eq('id', supplier.id);

  console.log('All tests passed and cleaned up.');
}

runTests().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});