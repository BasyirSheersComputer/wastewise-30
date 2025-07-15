import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Supabase URL:', process.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', process.env.VITE_SUPABASE_ANON_KEY);

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export async function getTopSellingItems() {
  // Example: fetch top selling items from supplier_orders (mock logic)
  const { data, error } = await supabase
    .from('supplier_orders')
    .select('items')
    .order('order_date', { ascending: false })
    .limit(50);
  if (error) return [];
  // Aggregate item counts
  const itemCounts = {};
  (data || []).forEach(order => {
    (order.items || []).forEach(item => {
      itemCounts[item.inventory_id] = (itemCounts[item.inventory_id] || 0) + item.quantity;
    });
  });
  // Return sorted top items
  return Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([inventory_id, quantity]) => ({ inventory_id, quantity }));
}

export async function getWasteStats() {
  const { data, error } = await supabase
    .from('waste_logs')
    .select('item_id, quantity, reason, date')
    .order('date', { ascending: false })
    .limit(50);
  if (error) return [];
  return data;
}

export async function getStaffTraining() {
  // Placeholder: fetch staff and mock training status
  const { data, error } = await supabase
    .from('user_staff_data')
    .select('id, name, role, status');
  if (error) return [];
  // Add mock training status
  return (data || []).map(staff => ({ ...staff, lastTraining: '2024-01-10', completed: Math.random() > 0.2 }));
}

export async function getSupplierRisk() {
  // Placeholder: fetch suppliers and mock risk
  const { data, error } = await supabase
    .from('supplier_data')
    .select('id, name, status, last_delivery, total_orders');
  if (error) return [];
  // Add mock risk
  return (data || []).map(supplier => ({ ...supplier, risk: Math.random() > 0.8 ? 'high' : 'low' }));
}

export async function getComplianceStats() {
  // Placeholder: return mock compliance data
  return [
    { area: 'Food Safety', risk: 'low' },
    { area: 'Waste Logs', risk: 'medium' },
    { area: 'Supplier Docs', risk: 'high' },
  ];
}

export async function getLocalHolidays() {
  // Static example, replace with API if needed
  return [
    { name: 'New Year', date: '2025-01-01' },
    { name: 'Independence Day', date: '2025-07-04' },
  ];
}

export async function getSeasons() {
  // Static example
  return [
    { name: 'Summer', peak: true },
    { name: 'Winter', peak: false },
  ];
}
