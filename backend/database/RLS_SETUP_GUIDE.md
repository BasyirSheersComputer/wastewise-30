# RLS (Row Level Security) Setup Guide

## 🎯 Objective
Fix the profiles table RLS infinite recursion issue and enable RLS policies for all tables in the Servora AI database.

## 📋 Current Status
- ✅ 13/13 new tables created
- ✅ 10/11 existing tables found and enhanced
- ❌ Profiles table has RLS infinite recursion issue
- ❌ Most tables don't have RLS enabled (1/24 tables)

## 🔧 Quick Fix Steps

### Step 1: Execute RLS Setup Script
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy the entire contents of `setup-rls-policies.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the script

### Step 2: Verify the Fix
After running the script, you can verify it worked by:

1. **Check RLS Status**: Go to **Authentication > Policies** in your Supabase Dashboard
2. **Test Database**: Run the test script again:
   ```bash
   node test-integrated-db.js
   ```

## 📊 Expected Results
After running the script, you should see:
- ✅ All 24 tables with RLS enabled
- ✅ No more infinite recursion errors
- ✅ Proper user data isolation
- ✅ Secure multi-tenant architecture

## 🔍 What the Script Does

### 1. Fixes Profiles Table
- Drops problematic existing policies
- Creates new policies that work with the existing structure
- Uses `auth.uid() = id` instead of `auth.uid() = user_id`

### 2. Enables RLS on All Tables
- **New Tables**: users, user_settings, coffee_chains, outlets, analytics, waste_data, recommendations, ai_cache, subscription_plans, user_subscriptions, billing_history, staff, training_records
- **Existing Tables**: inventory_data, menu_recipe_data, supplier_data, supplier_orders, user_staff_data, waste_logs, sales_pos_data, raw_data_lake, reports_dashboards, forecast_models_results

### 3. Creates Security Policies
- **SELECT**: Users can only view their own data
- **INSERT**: Users can only insert data for themselves
- **UPDATE**: Users can only update their own data
- **DELETE**: Users can only delete their own data

### 4. Grants Permissions
- Gives authenticated users full access to their data
- Gives anonymous users read access to subscription plans

## 🚨 Important Notes

1. **Backup First**: Consider backing up your database before running this script
2. **Test Environment**: If possible, test this on a development environment first
3. **User Impact**: Existing users will need to be authenticated to access their data
4. **Admin Access**: You may need admin privileges to run some parts of the script

## 🔄 Alternative Manual Approach

If the script fails, you can manually fix the profiles table:

1. Go to **Authentication > Policies**
2. Find the `profiles` table
3. Delete all existing policies
4. Create new policies:
   - **Name**: `profiles_select_policy`
   - **Operation**: SELECT
   - **Using expression**: `auth.uid() = id`
   - Repeat for INSERT, UPDATE, DELETE operations

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify your database connection
3. Ensure you have the necessary permissions
4. Test with a simple query first

## ✅ Success Criteria

The setup is successful when:
- `node test-integrated-db.js` shows 24/24 tables with RLS enabled
- No infinite recursion errors
- Users can access their own data but not others'
- All tables are properly secured 