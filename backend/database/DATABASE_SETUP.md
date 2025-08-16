# Database Setup Guide

This guide will help you set up the complete database schema for the WasteWise application.

## 🚀 Quick Setup Options

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Execute the Setup Script**
   - Copy the entire content from `setup-database.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Setup**
   - Go to the Table Editor
   - You should see all the tables listed below

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

### Option 3: Manual Table Creation

If you prefer to create tables manually, follow the sections below.

## 📋 Required Tables

### Core User Tables

#### 1. `users` Table
```sql
CREATE TABLE users (
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
```

#### 2. `user_settings` Table
```sql
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    idle_timeout INTEGER DEFAULT 30,
    preferred_llm TEXT DEFAULT 'auto' CHECK (preferred_llm IN ('auto', 'gemini', 'openai')),
    enable_idle_logout BOOLEAN DEFAULT true,
    enable_llm_fallback BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{}',
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Business Data Tables

#### 3. `coffee_chains` Table
```sql
CREATE TABLE coffee_chains (
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
```

#### 4. `outlets` Table
```sql
CREATE TABLE outlets (
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
```

### Analytics Tables

#### 5. `analytics` Table
```sql
CREATE TABLE analytics (
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
```

#### 6. `waste_data` Table
```sql
CREATE TABLE waste_data (
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
```

#### 7. `suppliers` Table
```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    supplier_type TEXT CHECK (supplier_type IN ('ingredients', 'packaging', 'equipment', 'services')),
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    reliability_score INTEGER CHECK (reliability_score >= 1 AND reliability_score <= 10),
    last_order_date DATE,
    average_delivery_time INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### AI & Recommendations Tables

#### 8. `recommendations` Table
```sql
CREATE TABLE recommendations (
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
```

#### 9. `ai_cache` Table
```sql
CREATE TABLE ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    response_data JSONB NOT NULL,
    provider TEXT NOT NULL,
    section TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Billing & Subscriptions Tables

#### 10. `subscription_plans` Table
```sql
CREATE TABLE subscription_plans (
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
```

#### 11. `user_subscriptions` Table
```sql
CREATE TABLE user_subscriptions (
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
```

#### 12. `billing_history` Table
```sql
CREATE TABLE billing_history (
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
```

### Staff & Training Tables

#### 13. `staff` Table
```sql
CREATE TABLE staff (
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
```

#### 14. `training_records` Table
```sql
CREATE TABLE training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    training_type TEXT CHECK (training_type IN ('waste_management', 'food_safety', 'customer_service', 'inventory_management')),
    completion_date DATE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    certificate_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Setup Steps

### Step 1: Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 2: Create Tables
Execute all the CREATE TABLE statements above in your Supabase SQL Editor.

### Step 3: Create Indexes
```sql
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_trial_end ON users(trial_end);

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_data_type ON analytics(data_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Waste data indexes
CREATE INDEX idx_waste_data_user_id ON waste_data(user_id);
CREATE INDEX idx_waste_data_outlet_id ON waste_data(outlet_id);
CREATE INDEX idx_waste_data_category ON waste_data(category);
CREATE INDEX idx_waste_data_recorded_at ON waste_data(recorded_at);

-- Recommendations indexes
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_section ON recommendations(section);
CREATE INDEX idx_recommendations_status ON recommendations(status);

-- AI cache indexes
CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_expires_at ON ai_cache(expires_at);

-- Billing indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
```

### Step 4: Create Triggers
```sql
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
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 5: Enable Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
```

### Step 6: Create RLS Policies
See the complete SQL file for all RLS policies.

### Step 7: Insert Default Data
```sql
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
```

## 🧪 Testing the Setup

After completing the setup, run the test script:

```bash
node test-db.js
```

This will verify that all tables are properly created and accessible.

## 📊 Expected Results

After successful setup, you should see:
- ✅ 14 tables created
- ✅ All indexes created
- ✅ RLS policies enabled
- ✅ Default subscription plans inserted
- ✅ Database connection fully operational

## 🚨 Troubleshooting

### Common Issues

1. **Permission Errors**: Make sure you're using the service role key for setup
2. **RLS Policy Errors**: Check that all policies are properly created
3. **Foreign Key Errors**: Ensure tables are created in the correct order
4. **Extension Errors**: Make sure the uuid-ossp extension is enabled

### Verification Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if indexes exist
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
```

## 🎉 Next Steps

After successful database setup:

1. **Test the API endpoints** to ensure they work with the new schema
2. **Create a test user** to verify the authentication flow
3. **Add sample data** to test the analytics and recommendations
4. **Configure environment variables** for production deployment

For any issues, check the Supabase logs or contact support. 