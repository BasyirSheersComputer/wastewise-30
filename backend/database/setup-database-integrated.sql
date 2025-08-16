-- Integrated Database Setup Script for WasteWise Application
-- This script integrates with existing tables and adds missing components

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE USER TABLES (Integrating with existing profiles)
-- =====================================================

-- Users table (extends existing profiles and Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT NOT NULL,
    company_size TEXT CHECK (company_size IN ('small', 'medium', 'large', 'enterprise')),
    primary_pain TEXT CHECK (primary_pain IN ('waste_reduction', 'cost_optimization', 'compliance', 'efficiency', 'sustainability')),
    phone_number TEXT,
    business_type TEXT DEFAULT 'restaurant' CHECK (business_type IN ('restaurant', 'cafe', 'bakery', 'catering', 'food_service')),
    locations INTEGER DEFAULT 1,
    annual_revenue TEXT CHECK (annual_revenue IN ('under_100k', '100k_500k', '500k_1m', '1m_5m', 'over_5m')),
    primary_goals TEXT[] DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    team_size TEXT DEFAULT '1-10' CHECK (team_size IN ('1-10', '11-25', '26-50', '51-100', '100+')),
    timezone TEXT DEFAULT 'Asia/Kuala_Lumpur',
    trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    idle_timeout INTEGER DEFAULT 30, -- minutes
    preferred_llm TEXT DEFAULT 'auto' CHECK (preferred_llm IN ('auto', 'gemini', 'openai')),
    enable_idle_logout BOOLEAN DEFAULT true,
    enable_llm_fallback BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{}',
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COFFEE CHAIN & BUSINESS DATA
-- =====================================================

-- Coffee chains table
CREATE TABLE IF NOT EXISTS coffee_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    chain_name TEXT NOT NULL,
    description TEXT,
    total_outlets INTEGER DEFAULT 1,
    primary_location TEXT,
    business_type TEXT DEFAULT 'coffee_chain',
    established_date DATE,
    annual_revenue_range TEXT,
    employee_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outlets table
CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id UUID REFERENCES coffee_chains(id) ON DELETE CASCADE,
    outlet_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Malaysia',
    phone_number TEXT,
    manager_name TEXT,
    outlet_type TEXT DEFAULT 'full_service' CHECK (outlet_type IN ('full_service', 'kiosk', 'drive_thru', 'catering')),
    seating_capacity INTEGER,
    operating_hours JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & DATA TABLES (Integrating with existing)
-- =====================================================

-- Analytics data table (complements existing raw_data_lake)
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('waste', 'sales', 'inventory', 'staff', 'compliance', 'supplier')),
    data JSONB NOT NULL,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waste tracking table (integrates with existing waste_logs)
CREATE TABLE IF NOT EXISTS waste_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    category TEXT CHECK (category IN ('food', 'packaging', 'beverage', 'ingredient', 'other')),
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'g', 'l', 'ml', 'pieces')),
    waste_type TEXT CHECK (waste_type IN ('spoiled', 'expired', 'overcooked', 'trimming', 'customer_return')),
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason TEXT,
    recorded_by TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RECOMMENDATIONS & AI DATA
-- =====================================================

-- AI recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    section TEXT NOT NULL CHECK (section IN ('waste', 'supplier', 'menu', 'training', 'compliance', 'inventory', 'demand', 'dashboard')),
    provider TEXT DEFAULT 'auto' CHECK (provider IN ('auto', 'gemini', 'openai')),
    recommendation_text TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category TEXT,
    estimated_savings DECIMAL(10,2),
    implementation_difficulty TEXT CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'dismissed', 'in_progress')),
    analytics_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI service cache table
CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    response_data JSONB NOT NULL,
    provider TEXT NOT NULL,
    section TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BILLING & SUBSCRIPTIONS
-- =====================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB,
    limits JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_method_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing history table
CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MYR',
    status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT,
    description TEXT,
    billing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STAFF & TRAINING (Integrating with existing user_staff_data)
-- =====================================================

-- Staff table (extends existing user_staff_data)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    hire_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    training_level TEXT DEFAULT 'basic' CHECK (training_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training records table
CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    training_type TEXT CHECK (training_type IN ('waste_management', 'food_safety', 'customer_service', 'inventory_management')),
    completion_date DATE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCE EXISTING TABLES
-- =====================================================

-- Add user_id to existing tables for proper integration
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE inventory_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE menu_recipe_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE supplier_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE supplier_orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_staff_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE waste_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE sales_pos_data ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE raw_data_lake ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE reports_dashboards ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE forecast_models_results ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add outlet_id to relevant existing tables
ALTER TABLE inventory_data ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE menu_recipe_data ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE supplier_orders ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE user_staff_data ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE waste_logs ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;
ALTER TABLE sales_pos_data ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL;

-- Add missing columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Add status columns where missing
ALTER TABLE inventory_data ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE menu_recipe_data ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE supplier_data ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_end ON users(trial_end);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_type ON analytics(data_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Waste data indexes
CREATE INDEX IF NOT EXISTS idx_waste_data_user_id ON waste_data(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_data_outlet_id ON waste_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_waste_data_category ON waste_data(category);
CREATE INDEX IF NOT EXISTS idx_waste_data_recorded_at ON waste_data(recorded_at);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_section ON recommendations(section);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);

-- AI cache indexes
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);

-- Existing table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_data_user_id ON inventory_data(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_data_outlet_id ON inventory_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_menu_recipe_data_user_id ON menu_recipe_data(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_recipe_data_outlet_id ON menu_recipe_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_supplier_data_user_id ON supplier_data(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_user_id ON supplier_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_outlet_id ON supplier_orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_user_staff_data_user_id ON user_staff_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_staff_data_outlet_id ON user_staff_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_user_id ON waste_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_outlet_id ON waste_logs(outlet_id);
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_user_id ON sales_pos_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_outlet_id ON sales_pos_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_lake_user_id ON raw_data_lake(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_dashboards_user_id ON reports_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_forecast_models_results_user_id ON forecast_models_results(user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coffee_chains_updated_at BEFORE UPDATE ON coffee_chains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outlets_updated_at BEFORE UPDATE ON outlets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
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

-- Enable RLS on existing tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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

-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coffee chains policies
CREATE POLICY "Users can view own chains" ON coffee_chains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own chains" ON coffee_chains FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chains" ON coffee_chains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chains" ON coffee_chains FOR DELETE USING (auth.uid() = user_id);

-- Outlets policies
CREATE POLICY "Users can view own outlets" ON outlets FOR SELECT USING (
    EXISTS (SELECT 1 FROM coffee_chains WHERE coffee_chains.id = outlets.chain_id AND coffee_chains.user_id = auth.uid())
);
CREATE POLICY "Users can update own outlets" ON outlets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM coffee_chains WHERE coffee_chains.id = outlets.chain_id AND coffee_chains.user_id = auth.uid())
);
CREATE POLICY "Users can insert own outlets" ON outlets FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM coffee_chains WHERE coffee_chains.id = outlets.chain_id AND coffee_chains.user_id = auth.uid())
);
CREATE POLICY "Users can delete own outlets" ON outlets FOR DELETE USING (
    EXISTS (SELECT 1 FROM coffee_chains WHERE coffee_chains.id = outlets.chain_id AND coffee_chains.user_id = auth.uid())
);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analytics" ON analytics FOR DELETE USING (auth.uid() = user_id);

-- Waste data policies
CREATE POLICY "Users can view own waste data" ON waste_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own waste data" ON waste_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waste data" ON waste_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own waste data" ON waste_data FOR DELETE USING (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recommendations" ON recommendations FOR DELETE USING (auth.uid() = user_id);

-- AI cache policies (shared but with expiration)
CREATE POLICY "Users can view cache" ON ai_cache FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can insert cache" ON ai_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update cache" ON ai_cache FOR UPDATE USING (true);
CREATE POLICY "Users can delete cache" ON ai_cache FOR DELETE USING (true);

-- Subscription plans (read-only for all authenticated users)
CREATE POLICY "Users can view subscription plans" ON subscription_plans FOR SELECT USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Billing history policies
CREATE POLICY "Users can view own billing history" ON billing_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own billing history" ON billing_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff policies
CREATE POLICY "Users can view own staff" ON staff FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own staff" ON staff FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own staff" ON staff FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own staff" ON staff FOR DELETE USING (auth.uid() = user_id);

-- Training records policies
CREATE POLICY "Users can view own training records" ON training_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = training_records.staff_id AND staff.user_id = auth.uid())
);
CREATE POLICY "Users can insert own training records" ON training_records FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = training_records.staff_id AND staff.user_id = auth.uid())
);
CREATE POLICY "Users can update own training records" ON training_records FOR UPDATE USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = training_records.staff_id AND staff.user_id = auth.uid())
);
CREATE POLICY "Users can delete own training records" ON training_records FOR DELETE USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = training_records.staff_id AND staff.user_id = auth.uid())
);

-- Existing table policies
CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own inventory" ON inventory_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON inventory_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON inventory_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own inventory" ON inventory_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own menu" ON menu_recipe_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own menu" ON menu_recipe_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own menu" ON menu_recipe_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own menu" ON menu_recipe_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own suppliers" ON supplier_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON supplier_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON supplier_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON supplier_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own supplier orders" ON supplier_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own supplier orders" ON supplier_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own supplier orders" ON supplier_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own supplier orders" ON supplier_orders FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own staff data" ON user_staff_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own staff data" ON user_staff_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own staff data" ON user_staff_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own staff data" ON user_staff_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own waste logs" ON waste_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own waste logs" ON waste_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own waste logs" ON waste_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own waste logs" ON waste_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sales data" ON sales_pos_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sales data" ON sales_pos_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales data" ON sales_pos_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales data" ON sales_pos_data FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own raw data" ON raw_data_lake FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own raw data" ON raw_data_lake FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own raw data" ON raw_data_lake FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own raw data" ON raw_data_lake FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON reports_dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON reports_dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON reports_dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON reports_dashboards FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own forecasts" ON forecast_models_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own forecasts" ON forecast_models_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forecasts" ON forecast_models_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own forecasts" ON forecast_models_results FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free', 'Basic features for small businesses', 0, 0, 
 '{"waste_tracking": true, "basic_analytics": true, "ai_recommendations": true, "email_support": true}', 
 '{"outlets": 1, "users": 1, "ai_calls_per_month": 100}'),
('basic', 'Basic', 'Essential features for growing businesses', 99, 990, 
 '{"waste_tracking": true, "advanced_analytics": true, "ai_recommendations": true, "email_support": true, "priority_support": true}', 
 '{"outlets": 5, "users": 3, "ai_calls_per_month": 1000}'),
('pro', 'Professional', 'Advanced features for established businesses', 199, 1990, 
 '{"waste_tracking": true, "advanced_analytics": true, "ai_recommendations": true, "priority_support": true, "custom_reports": true, "api_access": true}', 
 '{"outlets": 20, "users": 10, "ai_calls_per_month": 5000}'),
('enterprise', 'Enterprise', 'Custom solutions for large organizations', 499, 4990, 
 '{"waste_tracking": true, "advanced_analytics": true, "ai_recommendations": true, "dedicated_support": true, "custom_reports": true, "api_access": true, "white_label": true}', 
 '{"outlets": -1, "users": -1, "ai_calls_per_month": -1}')
ON CONFLICT (plan_name) DO NOTHING;

-- =====================================================
-- CLEANUP OLD CACHE ENTRIES FUNCTION
-- =====================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired cache (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

COMMIT; 