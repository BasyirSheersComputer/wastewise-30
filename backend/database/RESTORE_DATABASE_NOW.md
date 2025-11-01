# 🚨 Database Restoration Guide

## Current Status
- **Supabase Project**: `fbdqrqknqphcyxbmnuaf`
- **Issue**: Missing critical tables
- **Existing Tables**: users, user_settings, coffee_chains, analytics, recommendations (5 tables only)
- **Required Action**: Restore full database schema

---

## ⚡ Quick Restoration (Recommended)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/sql/new
2. You should see the SQL Editor

### Step 2: Run the Integrated Setup Script
1. Open the file: `backend/database/setup-database-integrated.sql`
2. Copy the ENTIRE content (all 558 lines)
3. Paste into the Supabase SQL Editor
4. Click **"RUN"** button (or press Ctrl+Enter)

### Step 3: Verify Restoration
After running the script, you should see:
- ✅ Success message
- ✅ All tables created
- ✅ RLS policies enabled
- ✅ Default data inserted

---

## 📋 What Will Be Created

### Core Tables (14 tables)
1. ✅ `users` - User profiles and account info
2. ✅ `user_settings` - User preferences
3. ✅ `coffee_chains` - Business/chain information
4. ✅ `outlets` - Outlet/location data
5. ✅ `analytics` - Analytics data storage
6. ✅ `waste_data` - Waste tracking
7. ✅ `suppliers` - Supplier management (NEW)
8. ✅ `recommendations` - AI recommendations
9. ✅ `ai_cache` - AI response caching (NEW)
10. ✅ `subscription_plans` - Subscription tiers (NEW)
11. ✅ `user_subscriptions` - User subscriptions (NEW)
12. ✅ `billing_history` - Billing records (NEW)
13. ✅ `staff` - Staff management (NEW)
14. ✅ `training_records` - Training data (NEW)

### Additional Features
- ✅ UUID Extension enabled
- ✅ Indexes for performance
- ✅ Triggers for auto-updates
- ✅ RLS (Row Level Security) policies
- ✅ Default subscription plans data
- ✅ Integration with existing tables (if any)

---

## 🔧 Alternative: Use Node.js Script

If the SQL Editor method doesn't work, use the backend script:

```powershell
# From project root
cd backend
node database/setup-database.js setup
```

**Note**: This method requires proper Supabase credentials in `.env` file.

---

## ✅ Verification Steps

### After Restoration, Verify:

1. **Check Table Count**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
Expected: At least 14 tables

2. **Check Default Data**
```sql
SELECT * FROM subscription_plans;
```
Expected: 4 rows (free, basic, pro, enterprise)

3. **Test RLS Policies**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```
Expected: Multiple RLS policies per table

4. **Run Node.js Verification**
```powershell
cd backend
node database/setup-database.js verify
```

---

## 🚨 Troubleshooting

### Issue: "relation already exists"
**Solution**: This is normal! The script uses `CREATE TABLE IF NOT EXISTS`, so it will skip existing tables.

### Issue: "permission denied"
**Solution**: Make sure you're using the **Service Role Key** in your `.env` file, not the anon key.

### Issue: RLS policy errors
**Solution**: The script will skip existing policies. If you see policy errors, they're usually safe to ignore.

### Issue: "cannot execute X in a read-only transaction"
**Solution**: You might be in the wrong SQL editor mode. Make sure you're in the regular SQL Editor, not the Query view.

---

## 📊 Expected Database Structure

After successful restoration:

```
wastewise-30 (fbdqrqknqphcyxbmnuaf)
├── Core Tables
│   ├── users (user accounts)
│   ├── user_settings (preferences)
│   ├── coffee_chains (businesses)
│   └── outlets (locations)
├── Data Tables
│   ├── analytics (aggregated data)
│   ├── waste_data (waste tracking)
│   └── suppliers (supplier info)
├── AI/ML Tables
│   ├── recommendations (AI insights)
│   └── ai_cache (cached responses)
├── Billing Tables
│   ├── subscription_plans (plan tiers)
│   ├── user_subscriptions (user plans)
│   └── billing_history (transactions)
└── Staff Tables
    ├── staff (employee data)
    └── training_records (training logs)
```

---

## 🎯 Next Steps After Restoration

1. **Populate Sample Data** (Optional)
```powershell
cd backend
node populate-coffee-industry-simple.js
```

2. **Test Backend Connection**
```powershell
cd backend
node test-connection.js
```

3. **Test Frontend**
- Start backend: `cd backend && npm start`
- Start frontend: `cd frontend && npm run dev`
- Visit: http://localhost:5173

---

## 💡 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf
- **SQL Editor**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/editor
- **Database Settings**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/settings/database

---

## 📞 Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Run: `node database/list-tables.js` to see current tables
3. Try the verification command: `node database/setup-database.js verify`

**Last Updated**: October 15, 2025


