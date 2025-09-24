-- Servora AI Database Schema
-- This file contains the complete database schema for the Servora AI SaaS platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired', 'suspended');
CREATE TYPE subscription_plan AS ENUM ('free', 'professional', 'enterprise', 'elite');
CREATE TYPE business_type AS ENUM ('restaurant', 'cafe', 'coffee_shop', 'bakery', 'food_truck', 'catering', 'other');
CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');
CREATE TYPE annual_revenue AS ENUM ('under_100k', '100k-500k', '500k-1m', '1m-5m', '5m+');
CREATE TYPE team_size AS ENUM ('1-10', '11-50', '51-200', '200+');

-- Core Tables

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    company_size company_size DEFAULT '1-10',
    primary_pain TEXT,
    phone_number TEXT,
    business_type business_type DEFAULT 'restaurant',
    locations INTEGER DEFAULT 1,
    annual_revenue annual_revenue DEFAULT 'under_100k',
    primary_goals TEXT[],
    data_sources TEXT[],
    team_size team_size DEFAULT '1-10',
    timezone TEXT DEFAULT 'Asia/Kuala_Lumpur',
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    subscription_status subscription_status DEFAULT 'trial',
    subscription_plan subscription_plan DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outlets table
CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Malaysia',
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    manager_name TEXT,
    capacity INTEGER,
    opening_hours JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Malaysia',
    postal_code TEXT,
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    max_stock DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2),
    supplier_id UUID REFERENCES suppliers(id),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waste logs table
CREATE TABLE IF NOT EXISTS waste_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    waste_type TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    cost DECIMAL(10,2),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales/POS data table
CREATE TABLE IF NOT EXISTS sales_pos_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    transaction_id TEXT,
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    product_name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    customer_id TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer data table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL,
    customer_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    date_of_birth DATE,
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_visit DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, customer_id)
);

-- Staff training table
CREATE TABLE IF NOT EXISTS staff_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    staff_name TEXT NOT NULL,
    training_type TEXT NOT NULL,
    completion_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue Reporting Tables

-- Issue categories table
CREATE TABLE IF NOT EXISTS issue_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue priorities table
CREATE TABLE IF NOT EXISTS issue_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    sla_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue statuses table
CREATE TABLE IF NOT EXISTS issue_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    is_final BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES issue_categories(id),
    priority_id UUID REFERENCES issue_priorities(id),
    status_id UUID REFERENCES issue_statuses(id),
    browser_info JSONB,
    device_info JSONB,
    page_url TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    attachments JSONB DEFAULT '[]',
    internal_notes TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    estimated_resolution_date TIMESTAMP WITH TIME ZONE,
    actual_resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Issue comments table
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue history table
CREATE TABLE IF NOT EXISTS issue_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing and Subscription Tables

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_payment_intent_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    stripe_invoice_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    status TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and Reporting Tables

-- Analytics cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cache_key TEXT NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cache_key)
);

-- AI recommendations cache table
CREATE TABLE IF NOT EXISTS ai_recommendations_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    provider TEXT NOT NULL,
    recommendations JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, section, provider)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_end ON users(trial_end);
CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name);

-- Outlets indexes
CREATE INDEX IF NOT EXISTS idx_outlets_user_id ON outlets(user_id);
CREATE INDEX IF NOT EXISTS idx_outlets_active ON outlets(is_active);
CREATE INDEX IF NOT EXISTS idx_outlets_city ON outlets(city);
CREATE INDEX IF NOT EXISTS idx_outlets_state ON outlets(state);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON suppliers(city);
CREATE INDEX IF NOT EXISTS idx_suppliers_state ON suppliers(state);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_outlet_id ON inventory(outlet_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id ON inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(user_id, current_stock, min_stock) WHERE is_active = true;

-- Waste logs indexes
CREATE INDEX IF NOT EXISTS idx_waste_logs_user_id ON waste_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_outlet_id ON waste_logs(outlet_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_date ON waste_logs(date);
CREATE INDEX IF NOT EXISTS idx_waste_logs_type ON waste_logs(waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_logs_user_date ON waste_logs(user_id, date DESC);

-- Sales POS data indexes
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_user_id ON sales_pos_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_outlet_id ON sales_pos_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_date ON sales_pos_data(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_category ON sales_pos_data(category);
CREATE INDEX IF NOT EXISTS idx_sales_pos_data_user_date ON sales_pos_data(user_id, transaction_date DESC);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit);

-- Staff training indexes
CREATE INDEX IF NOT EXISTS idx_staff_training_user_id ON staff_training(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_training_outlet_id ON staff_training(outlet_id);
CREATE INDEX IF NOT EXISTS idx_staff_training_status ON staff_training(status);
CREATE INDEX IF NOT EXISTS idx_staff_training_expiry ON staff_training(expiry_date);

-- Issues indexes
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_outlet_id ON issues(outlet_id);
CREATE INDEX IF NOT EXISTS idx_issues_status_id ON issues(status_id);
CREATE INDEX IF NOT EXISTS idx_issues_priority_id ON issues(priority_id);
CREATE INDEX IF NOT EXISTS idx_issues_category_id ON issues(category_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);

-- Issue comments indexes
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at);

-- Issue history indexes
CREATE INDEX IF NOT EXISTS idx_issue_history_issue_id ON issue_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_user_id ON issue_history(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_created_at ON issue_history(created_at);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Analytics cache indexes
CREATE INDEX IF NOT EXISTS idx_analytics_cache_user_id ON analytics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires_at ON analytics_cache(expires_at);

-- AI recommendations cache indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_cache_user_id ON ai_recommendations_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_cache_section ON ai_recommendations_cache(section);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_cache_expires_at ON ai_recommendations_cache(expires_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_pos_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Outlets policies
CREATE POLICY "Users can manage own outlets" ON outlets FOR ALL USING (auth.uid() = user_id);

-- Suppliers policies
CREATE POLICY "Users can manage own suppliers" ON suppliers FOR ALL USING (auth.uid() = user_id);

-- Inventory policies
CREATE POLICY "Users can manage own inventory" ON inventory FOR ALL USING (auth.uid() = user_id);

-- Waste logs policies
CREATE POLICY "Users can manage own waste logs" ON waste_logs FOR ALL USING (auth.uid() = user_id);

-- Sales POS data policies
CREATE POLICY "Users can manage own sales data" ON sales_pos_data FOR ALL USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can manage own customers" ON customers FOR ALL USING (auth.uid() = user_id);

-- Staff training policies
CREATE POLICY "Users can manage own staff training" ON staff_training FOR ALL USING (auth.uid() = user_id);

-- Issues policies
CREATE POLICY "Users can manage own issues" ON issues FOR ALL USING (auth.uid() = user_id);

-- Issue comments policies
CREATE POLICY "Users can manage own issue comments" ON issue_comments FOR ALL USING (auth.uid() = user_id);

-- Issue history policies
CREATE POLICY "Users can view own issue history" ON issue_history FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);

-- Analytics cache policies
CREATE POLICY "Users can manage own analytics cache" ON analytics_cache FOR ALL USING (auth.uid() = user_id);

-- AI recommendations cache policies
CREATE POLICY "Users can manage own AI recommendations cache" ON ai_recommendations_cache FOR ALL USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outlets_updated_at BEFORE UPDATE ON outlets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waste_logs_updated_at BEFORE UPDATE ON waste_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_pos_data_updated_at BEFORE UPDATE ON sales_pos_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_training_updated_at BEFORE UPDATE ON staff_training FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_issue_comments_updated_at BEFORE UPDATE ON issue_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Audit triggers for important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_outlets AFTER INSERT OR UPDATE OR DELETE ON outlets FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON suppliers FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON inventory FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_waste_logs AFTER INSERT OR UPDATE OR DELETE ON waste_logs FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_issues AFTER INSERT OR UPDATE OR DELETE ON issues FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM analytics_cache WHERE expires_at < NOW();
    DELETE FROM ai_recommendations_cache WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to get user trial status
CREATE OR REPLACE FUNCTION get_user_trial_status(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    user_record users%ROWTYPE;
    days_left INTEGER;
    is_expired BOOLEAN;
BEGIN
    SELECT * INTO user_record FROM users WHERE id = user_uuid;
    
    IF user_record.trial_end IS NULL THEN
        RETURN json_build_object('status', 'no_trial', 'days_left', 0, 'is_expired', false);
    END IF;
    
    days_left := GREATEST(0, EXTRACT(DAYS FROM (user_record.trial_end - NOW())));
    is_expired := NOW() > user_record.trial_end;
    
    RETURN json_build_object(
        'status', user_record.subscription_status,
        'plan', user_record.subscription_plan,
        'trial_start', user_record.trial_start,
        'trial_end', user_record.trial_end,
        'days_left', days_left,
        'is_expired', is_expired
    );
END;
$$ language 'plpgsql';

-- Function to get low stock items
CREATE OR REPLACE FUNCTION get_low_stock_items(user_uuid UUID)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    current_stock DECIMAL,
    min_stock DECIMAL,
    outlet_name TEXT,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.item_name,
        i.current_stock,
        i.min_stock,
        o.outlet_name,
        CASE 
            WHEN i.expiry_date IS NOT NULL THEN 
                EXTRACT(DAYS FROM (i.expiry_date - CURRENT_DATE))::INTEGER
            ELSE NULL
        END
    FROM inventory i
    LEFT JOIN outlets o ON i.outlet_id = o.id
    WHERE i.user_id = user_uuid
        AND i.is_active = true
        AND i.current_stock <= i.min_stock
    ORDER BY (i.current_stock - i.min_stock), i.expiry_date;
END;
$$ language 'plpgsql';

-- Function to get waste analytics
CREATE OR REPLACE FUNCTION get_waste_analytics(user_uuid UUID, start_date DATE, end_date DATE)
RETURNS JSON AS $$
DECLARE
    total_waste DECIMAL;
    total_cost DECIMAL;
    waste_by_type JSON;
    waste_by_date JSON;
BEGIN
    -- Get total waste and cost
    SELECT 
        COALESCE(SUM(quantity), 0),
        COALESCE(SUM(cost), 0)
    INTO total_waste, total_cost
    FROM waste_logs
    WHERE user_id = user_uuid
        AND date BETWEEN start_date AND end_date;
    
    -- Get waste by type
    SELECT json_object_agg(waste_type, type_stats) INTO waste_by_type
    FROM (
        SELECT 
            waste_type,
            json_build_object(
                'quantity', SUM(quantity),
                'cost', SUM(cost),
                'count', COUNT(*)
            ) as type_stats
        FROM waste_logs
        WHERE user_id = user_uuid
            AND date BETWEEN start_date AND end_date
        GROUP BY waste_type
    ) type_aggregates;
    
    -- Get waste by date
    SELECT json_object_agg(date, date_stats) INTO waste_by_date
    FROM (
        SELECT 
            date,
            json_build_object(
                'quantity', SUM(quantity),
                'cost', SUM(cost),
                'count', COUNT(*)
            ) as date_stats
        FROM waste_logs
        WHERE user_id = user_uuid
            AND date BETWEEN start_date AND end_date
        GROUP BY date
        ORDER BY date
    ) date_aggregates;
    
    RETURN json_build_object(
        'total_waste', total_waste,
        'total_cost', total_cost,
        'waste_by_type', waste_by_type,
        'waste_by_date', waste_by_date,
        'period_start', start_date,
        'period_end', end_date
    );
END;
$$ language 'plpgsql';

-- Insert default issue categories
INSERT INTO issue_categories (name, description, icon, color, sort_order) VALUES
('Bug', 'Software bugs and technical issues', 'bug', '#EF4444', 1),
('Feature Request', 'Requests for new features or improvements', 'lightbulb', '#3B82F6', 2),
('UI/UX', 'User interface and user experience issues', 'palette', '#8B5CF6', 3),
('Performance', 'Performance and speed related issues', 'zap', '#F59E0B', 4),
('Integration', 'Third-party integration issues', 'link', '#10B981', 5),
('Data', 'Data related issues and concerns', 'database', '#6B7280', 6),
('Security', 'Security related issues and concerns', 'shield', '#DC2626', 7),
('Other', 'Other issues not covered above', 'help-circle', '#9CA3AF', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default issue priorities
INSERT INTO issue_priorities (name, description, color, sort_order, sla_hours) VALUES
('Critical', 'Critical issues that need immediate attention', '#DC2626', 1, 2),
('High', 'High priority issues that should be resolved quickly', '#F59E0B', 2, 8),
('Medium', 'Medium priority issues with normal response time', '#3B82F6', 3, 24),
('Low', 'Low priority issues that can be addressed later', '#6B7280', 4, 72)
ON CONFLICT (name) DO NOTHING;

-- Insert default issue statuses
INSERT INTO issue_statuses (name, description, color, sort_order, is_final) VALUES
('Open', 'New issue that has been reported', '#3B82F6', 1, false),
('In Progress', 'Issue is being worked on', '#F59E0B', 2, false),
('In Review', 'Issue is being reviewed or tested', '#8B5CF6', 3, false),
('Resolved', 'Issue has been resolved', '#10B981', 4, false),
('Closed', 'Issue has been closed', '#6B7280', 5, true),
('Cancelled', 'Issue has been cancelled', '#9CA3AF', 6, true)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_low_stock_performance ON inventory(user_id, current_stock, min_stock) WHERE is_active = true AND current_stock <= min_stock;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_waste_logs_analytics ON waste_logs(user_id, date, waste_type, quantity, cost);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_pos_data_analytics ON sales_pos_data(user_id, transaction_date, category, total_amount);

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE outlets IS 'Restaurant/coffee shop locations for multi-location businesses';
COMMENT ON TABLE suppliers IS 'Supplier information and contact details';
COMMENT ON TABLE inventory IS 'Inventory items with stock levels and supplier information';
COMMENT ON TABLE waste_logs IS 'Waste tracking logs with quantities, costs, and reasons';
COMMENT ON TABLE sales_pos_data IS 'Point of sale transaction data';
COMMENT ON TABLE customers IS 'Customer information and loyalty data';
COMMENT ON TABLE staff_training IS 'Staff training records and compliance tracking';
COMMENT ON TABLE issues IS 'Issue reporting and tracking system';
COMMENT ON TABLE subscriptions IS 'User subscription and billing information';
COMMENT ON TABLE analytics_cache IS 'Cached analytics data for performance';
COMMENT ON TABLE ai_recommendations_cache IS 'Cached AI recommendations for performance';
COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes';
