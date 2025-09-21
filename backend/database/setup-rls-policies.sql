-- Comprehensive RLS Policy Setup for Servora AI Database
-- Run this script in Supabase Dashboard > SQL Editor

-- =====================================================
-- 1. FIX PROFILES TABLE RLS ISSUE
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies that work with existing structure
CREATE POLICY "profiles_select_policy" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles 
FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- 2. ENABLE RLS ON ALL TABLES
-- =====================================================

-- New tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

-- Existing tables
ALTER TABLE inventory_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_recipe_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_staff_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_pos_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_data_lake ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_models_results ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Users table policies
CREATE POLICY "users_select_policy" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_policy" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_delete_policy" ON users 
FOR DELETE USING (auth.uid() = id);

-- User settings policies
CREATE POLICY "user_settings_select_policy" ON user_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_policy" ON user_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_policy" ON user_settings 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_settings_delete_policy" ON user_settings 
FOR DELETE USING (auth.uid() = user_id);

-- Coffee chains policies
CREATE POLICY "coffee_chains_select_policy" ON coffee_chains 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "coffee_chains_insert_policy" ON coffee_chains 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coffee_chains_update_policy" ON coffee_chains 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "coffee_chains_delete_policy" ON coffee_chains 
FOR DELETE USING (auth.uid() = user_id);

-- Outlets policies
CREATE POLICY "outlets_select_policy" ON outlets 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "outlets_insert_policy" ON outlets 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outlets_update_policy" ON outlets 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "outlets_delete_policy" ON outlets 
FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "analytics_select_policy" ON analytics 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_insert_policy" ON analytics 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analytics_update_policy" ON analytics 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "analytics_delete_policy" ON analytics 
FOR DELETE USING (auth.uid() = user_id);

-- Waste data policies
CREATE POLICY "waste_data_select_policy" ON waste_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "waste_data_insert_policy" ON waste_data 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "waste_data_update_policy" ON waste_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "waste_data_delete_policy" ON waste_data 
FOR DELETE USING (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "recommendations_select_policy" ON recommendations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recommendations_insert_policy" ON recommendations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recommendations_update_policy" ON recommendations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "recommendations_delete_policy" ON recommendations 
FOR DELETE USING (auth.uid() = user_id);

-- AI cache policies
CREATE POLICY "ai_cache_select_policy" ON ai_cache 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_cache_insert_policy" ON ai_cache 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_cache_update_policy" ON ai_cache 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ai_cache_delete_policy" ON ai_cache 
FOR DELETE USING (auth.uid() = user_id);

-- Subscription plans policies (read-only for all authenticated users)
CREATE POLICY "subscription_plans_select_policy" ON subscription_plans 
FOR SELECT USING (auth.role() = 'authenticated');

-- User subscriptions policies
CREATE POLICY "user_subscriptions_select_policy" ON user_subscriptions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_policy" ON user_subscriptions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_policy" ON user_subscriptions 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_delete_policy" ON user_subscriptions 
FOR DELETE USING (auth.uid() = user_id);

-- Billing history policies
CREATE POLICY "billing_history_select_policy" ON billing_history 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "billing_history_insert_policy" ON billing_history 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "billing_history_update_policy" ON billing_history 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "billing_history_delete_policy" ON billing_history 
FOR DELETE USING (auth.uid() = user_id);

-- Staff policies
CREATE POLICY "staff_select_policy" ON staff 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "staff_insert_policy" ON staff 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "staff_update_policy" ON staff 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "staff_delete_policy" ON staff 
FOR DELETE USING (auth.uid() = user_id);

-- Training records policies
CREATE POLICY "training_records_select_policy" ON training_records 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "training_records_insert_policy" ON training_records 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_records_update_policy" ON training_records 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "training_records_delete_policy" ON training_records 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE RLS POLICIES FOR EXISTING TABLES
-- =====================================================

-- Inventory data policies
CREATE POLICY "inventory_data_select_policy" ON inventory_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "inventory_data_insert_policy" ON inventory_data 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inventory_data_update_policy" ON inventory_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "inventory_data_delete_policy" ON inventory_data 
FOR DELETE USING (auth.uid() = user_id);

-- Menu recipe data policies
CREATE POLICY "menu_recipe_data_select_policy" ON menu_recipe_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "menu_recipe_data_insert_policy" ON menu_recipe_data 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "menu_recipe_data_update_policy" ON menu_recipe_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "menu_recipe_data_delete_policy" ON menu_recipe_data 
FOR DELETE USING (auth.uid() = user_id);

-- Supplier data policies
CREATE POLICY "supplier_data_select_policy" ON supplier_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "supplier_data_insert_policy" ON supplier_data 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "supplier_data_update_policy" ON supplier_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "supplier_data_delete_policy" ON supplier_data 
FOR DELETE USING (auth.uid() = user_id);

-- Supplier orders policies
CREATE POLICY "supplier_orders_select_policy" ON supplier_orders 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "supplier_orders_insert_policy" ON supplier_orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "supplier_orders_update_policy" ON supplier_orders 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "supplier_orders_delete_policy" ON supplier_orders 
FOR DELETE USING (auth.uid() = user_id);

-- User staff data policies
CREATE POLICY "user_staff_data_select_policy" ON user_staff_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_staff_data_insert_policy" ON user_staff_data 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_staff_data_update_policy" ON user_staff_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_staff_data_delete_policy" ON user_staff_data 
FOR DELETE USING (auth.uid() = user_id);

-- Waste logs policies
CREATE POLICY "waste_logs_select_policy" ON waste_logs 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "waste_logs_insert_policy" ON waste_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "waste_logs_update_policy" ON waste_logs 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "waste_logs_delete_policy" ON waste_logs 
FOR DELETE USING (auth.uid() = user_id);

-- Sales POS data policies
CREATE POLICY "sales_pos_data_select_policy" ON sales_pos_data 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sales_pos_data_insert_policy" ON sales_pos_data 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sales_pos_data_update_policy" ON sales_pos_data 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "sales_pos_data_delete_policy" ON sales_pos_data 
FOR DELETE USING (auth.uid() = user_id);

-- Raw data lake policies
CREATE POLICY "raw_data_lake_select_policy" ON raw_data_lake 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "raw_data_lake_insert_policy" ON raw_data_lake 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "raw_data_lake_update_policy" ON raw_data_lake 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "raw_data_lake_delete_policy" ON raw_data_lake 
FOR DELETE USING (auth.uid() = user_id);

-- Reports dashboards policies
CREATE POLICY "reports_dashboards_select_policy" ON reports_dashboards 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reports_dashboards_insert_policy" ON reports_dashboards 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports_dashboards_update_policy" ON reports_dashboards 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reports_dashboards_delete_policy" ON reports_dashboards 
FOR DELETE USING (auth.uid() = user_id);

-- Forecast models results policies
CREATE POLICY "forecast_models_results_select_policy" ON forecast_models_results 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "forecast_models_results_insert_policy" ON forecast_models_results 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forecast_models_results_update_policy" ON forecast_models_results 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "forecast_models_results_delete_policy" ON forecast_models_results 
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON coffee_chains TO authenticated;
GRANT ALL ON outlets TO authenticated;
GRANT ALL ON analytics TO authenticated;
GRANT ALL ON waste_data TO authenticated;
GRANT ALL ON recommendations TO authenticated;
GRANT ALL ON ai_cache TO authenticated;
GRANT ALL ON subscription_plans TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON billing_history TO authenticated;
GRANT ALL ON staff TO authenticated;
GRANT ALL ON training_records TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Grant permissions to existing tables
GRANT ALL ON inventory_data TO authenticated;
GRANT ALL ON menu_recipe_data TO authenticated;
GRANT ALL ON supplier_data TO authenticated;
GRANT ALL ON supplier_orders TO authenticated;
GRANT ALL ON user_staff_data TO authenticated;
GRANT ALL ON waste_logs TO authenticated;
GRANT ALL ON sales_pos_data TO authenticated;
GRANT ALL ON raw_data_lake TO authenticated;
GRANT ALL ON reports_dashboards TO authenticated;
GRANT ALL ON forecast_models_results TO authenticated;

-- Grant read permissions to anon users for subscription plans
GRANT SELECT ON subscription_plans TO anon;

-- =====================================================
-- 6. VERIFICATION QUERY
-- =====================================================

-- Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 

-- Fix RLS Policies for User Profile Creation
-- This script ensures that users can create their own profiles

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a more permissive insert policy for user profiles
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
);

-- Also allow users to insert profiles during signup process
CREATE POLICY "Allow profile creation during signup" ON users 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL OR 
  email IS NOT NULL
);

-- Ensure users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT 
USING (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_settings TO authenticated;

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to automatically create user profiles
  -- when new users are created in auth.users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation (optional)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMIT; 