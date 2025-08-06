# Integrated Database Setup Guide

This guide helps you integrate your existing database tables with the new WasteWise application features.

## 🎯 **Integration Overview**

### **Existing Tables (11 tables):**
- ✅ `forecast_models_results` - AI forecasting results
- ✅ `inventory_data` - Inventory management
- ✅ `menu_recipe_data` - Menu and recipe data
- ✅ `profiles` - User profiles
- ✅ `raw_data_lake` - Raw data storage
- ✅ `reports_dashboards` - Reports and dashboards
- ✅ `sales_pos_data` - Point of sale data
- ✅ `supplier_data` - Supplier information
- ✅ `supplier_orders` - Supplier order management
- ✅ `user_staff_data` - Staff management
- ✅ `waste_logs` - Waste tracking logs

### **New Tables (13 tables):**
- 🆕 `users` - Extended user management
- 🆕 `user_settings` - User preferences
- 🆕 `coffee_chains` - Coffee chain business data
- 🆕 `outlets` - Individual outlet management
- 🆕 `analytics` - Analytics data storage
- 🆕 `waste_data` - Enhanced waste tracking
- 🆕 `recommendations` - AI recommendations
- 🆕 `ai_cache` - AI service caching
- 🆕 `subscription_plans` - Subscription plans
- 🆕 `user_subscriptions` - User subscription data
- 🆕 `billing_history` - Billing records
- 🆕 `staff` - Enhanced staff management
- 🆕 `training_records` - Training records

## 🚀 **Quick Setup**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Execute the Integration Script**
   - Copy the entire content from `setup-database-integrated.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Integration**
   - Go to the Table Editor
   - You should see all 24 tables (11 existing + 13 new)

### **Option 2: Test the Integration**

After running the setup script, test the integration:

```bash
node test-integrated-db.js
```

## 🔧 **Integration Details**

### **Enhanced Existing Tables**

The integration script adds the following columns to your existing tables:

#### **profiles** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
company_name TEXT
subscription_status TEXT DEFAULT 'trial'
subscription_plan TEXT DEFAULT 'free'
trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW()
trial_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
```

#### **inventory_data** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL
status TEXT DEFAULT 'active'
```

#### **menu_recipe_data** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL
status TEXT DEFAULT 'active'
```

#### **supplier_data** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
status TEXT DEFAULT 'active'
```

#### **supplier_orders** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL
```

#### **user_staff_data** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL
```

#### **waste_logs** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL
```

#### **sales_pos_data** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL
```

#### **raw_data_lake** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
```

#### **reports_dashboards** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
```

#### **forecast_models_results** Table Enhancements:
```sql
-- Added columns
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
```

## 🔗 **Table Relationships**

### **User-Centric Architecture**
```
auth.users (Supabase Auth)
    ↓
users (Extended user data)
    ↓
[All other tables with user_id]
```

### **Outlet-Centric Architecture**
```
coffee_chains (Business chains)
    ↓
outlets (Individual locations)
    ↓
[Inventory, Menu, Staff, Sales, Waste data]
```

### **Data Flow**
```
Raw Data (raw_data_lake)
    ↓
Processed Data (analytics, waste_data, sales_pos_data)
    ↓
AI Analysis (recommendations, forecast_models_results)
    ↓
Reports (reports_dashboards)
```

## 🔒 **Security Features**

### **Row Level Security (RLS)**
All tables now have RLS policies that ensure:
- Users can only access their own data
- Multi-tenant isolation
- Secure data sharing between outlets

### **Enhanced Policies**
- **User Isolation**: Each user can only see their own data
- **Outlet Isolation**: Users can only access data from their outlets
- **Chain Isolation**: Users can only access data from their coffee chains

## 📊 **Performance Optimizations**

### **Indexes Added**
- User-based indexes for fast user data queries
- Outlet-based indexes for fast outlet data queries
- Status-based indexes for filtering
- Timestamp-based indexes for time-series data

### **Query Optimization**
- Efficient joins between users, outlets, and data tables
- Optimized queries for analytics and reporting
- Cached AI responses for better performance

## 🧪 **Testing the Integration**

### **Run the Test Script**
```bash
node test-integrated-db.js
```

### **Expected Results**
- ✅ **11 existing tables** found and enhanced
- ✅ **13 new tables** created successfully
- ✅ **All tables** have proper RLS policies
- ✅ **Enhanced columns** added to existing tables
- ✅ **Indexes** created for performance
- ✅ **Default data** inserted (subscription plans)

### **Test Coverage**
1. **Existing Tables**: Verifies all 11 existing tables are accessible
2. **New Tables**: Verifies all 13 new tables are created
3. **Enhanced Columns**: Checks that new columns are added to existing tables
4. **RLS Policies**: Verifies security policies are working
5. **Performance**: Tests query performance with new indexes

## 🔄 **Migration Strategy**

### **Phase 1: Schema Updates**
1. Run the integration SQL script
2. Verify all tables are created/enhanced
3. Test RLS policies

### **Phase 2: Data Migration**
1. Update existing data with user_id references
2. Link existing data to appropriate outlets
3. Verify data integrity

### **Phase 3: Application Updates**
1. Update application code to use new schema
2. Test all features with integrated database
3. Deploy to production

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Permission Errors**
   ```sql
   -- Check if RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. **Missing Columns**
   ```sql
   -- Check if columns were added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles';
   ```

3. **Foreign Key Errors**
   ```sql
   -- Check foreign key constraints
   SELECT 
       tc.table_name, 
       kcu.column_name, 
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
       ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
       ON ccu.constraint_name = tc.constraint_name
   WHERE constraint_type = 'FOREIGN KEY';
   ```

### **Verification Commands**

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';
```

## 🎉 **Next Steps**

After successful integration:

1. **Update Application Code**
   - Modify queries to use new user_id and outlet_id columns
   - Update authentication to work with new user table
   - Test all features with integrated schema

2. **Data Migration**
   - Link existing data to appropriate users
   - Create outlet records for existing data
   - Verify data integrity

3. **Performance Monitoring**
   - Monitor query performance
   - Optimize slow queries
   - Add additional indexes if needed

4. **Security Review**
   - Test RLS policies
   - Verify data isolation
   - Review access patterns

## 📋 **Complete Table List**

### **Total: 24 Tables**

**Existing (11):**
- `forecast_models_results`
- `inventory_data`
- `menu_recipe_data`
- `profiles`
- `raw_data_lake`
- `reports_dashboards`
- `sales_pos_data`
- `supplier_data`
- `supplier_orders`
- `user_staff_data`
- `waste_logs`

**New (13):**
- `users`
- `user_settings`
- `coffee_chains`
- `outlets`
- `analytics`
- `waste_data`
- `recommendations`
- `ai_cache`
- `subscription_plans`
- `user_subscriptions`
- `billing_history`
- `staff`
- `training_records`

The integration provides a complete, secure, and scalable database architecture for your WasteWise application! 