# 🚨 WasteWise Database Restoration Guide

## Problem Identified
✅ Your Supabase database (`fbdqrqknqphcyxbmnuaf`) is missing critical tables.

## ⚡ QUICK START (Choose ONE method)

---

### 🎯 Method 1: Automated Script (Recommended - 2 minutes)

**Step 1**: Run the PowerShell restoration script:
```powershell
.\restore-database.ps1
```

This script will:
- ✅ Guide you to get your Supabase SERVICE_ROLE key
- ✅ Create the backend/.env file automatically  
- ✅ Execute the database restoration
- ✅ Verify all tables are created

**That's it!** The script handles everything automatically.

---

### 📝 Method 2: Manual Supabase SQL Editor (3 minutes)

**Step 1**: Get your Supabase Service Role Key
1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/settings/api
2. Find the **`service_role`** key (NOT the anon key)
3. Copy it

**Step 2**: Run the SQL script
1. Go to SQL Editor: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/sql/new
2. Open file: `backend/database/setup-database-integrated.sql`
3. Copy **ALL** the content (Ctrl+A, Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click **"RUN"** button

**Step 3**: Verify
Go to Table Editor: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/editor

You should see 14+ tables!

---

## 📊 What Will Be Restored

### Core Tables (14+)
1. ✅ `users` - User accounts and profiles
2. ✅ `user_settings` - User preferences
3. ✅ `coffee_chains` - Business/chain info
4. ✅ `outlets` - Location/outlet data
5. ✅ `analytics` - Analytics data
6. ✅ `waste_data` - Waste tracking
7. ✅ `suppliers` - Supplier management
8. ✅ `recommendations` - AI recommendations
9. ✅ `ai_cache` - AI response caching
10. ✅ `subscription_plans` - Plan tiers (with default data)
11. ✅ `user_subscriptions` - User subscriptions
12. ✅ `billing_history` - Billing records
13. ✅ `staff` - Staff management
14. ✅ `training_records` - Training data

### Additional Features
- ✅ **Indexes** for performance optimization
- ✅ **Triggers** for automatic timestamp updates
- ✅ **RLS (Row Level Security)** policies for data protection
- ✅ **Default subscription plans** (Free, Basic, Pro, Enterprise)
- ✅ **UUID extension** enabled

---

## 🔍 Verification

After restoration, verify with these commands:

### Check tables exist:
```powershell
cd backend
node database/list-tables.js
```

Expected output: At least 14 tables

### Check subscription plans:
Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/editor/subscription_plans

Should see 4 rows:
- Free
- Basic  
- Pro
- Enterprise

---

## 📝 Next Steps (After Restoration)

### 1. Populate Sample Data (Optional)
```powershell
cd backend
node populate-coffee-industry-simple.js
```

This will add:
- Sample coffee chain business
- Sample outlets
- Sample waste data
- Sample analytics

### 2. Test Backend Connection
```powershell
cd backend
node test-connection.js
```

Should show: ✅ All connections working

### 3. Start the Application
```powershell
# Terminal 1 - Backend
cd backend
npm install  # if not already done
npm start

# Terminal 2 - Frontend
cd frontend
npm install  # if not already done
npm run dev
```

Visit: http://localhost:5173

---

## 🚨 Troubleshooting

### Error: "Missing Supabase credentials"
**Solution**: Make sure you have `backend/.env` with correct SERVICE_ROLE key

### Error: "relation already exists"
**Solution**: This is normal! The script safely skips existing tables

### Error: "permission denied"
**Solution**: You're using the ANON key instead of SERVICE_ROLE key. Get the correct one from Supabase settings.

### Error: "cannot execute in read-only transaction"
**Solution**: Make sure you're in the SQL Editor, not the Query viewer

---

## 📁 Important Files Created

1. **`restore-database.ps1`** - Automated restoration script
2. **`backend/database/restore-database-complete.js`** - Node.js restoration
3. **`backend/database/setup-database-integrated.sql`** - Complete SQL schema (558 lines)
4. **`backend/database/RESTORE_DATABASE_NOW.md`** - Detailed instructions
5. **`backend/SETUP_ENV_INSTRUCTIONS.md`** - Environment setup guide

---

## 🎯 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf
- **SQL Editor**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/editor
- **API Settings**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/settings/api

---

## ✅ Success Criteria

After running restoration, you should have:
- [x] 14+ tables visible in Supabase Table Editor
- [x] 4 subscription plans in `subscription_plans` table
- [x] All tables have RLS policies enabled
- [x] `backend/list-tables.js` shows all tables
- [x] Backend connects successfully

---

## 💡 Recommended Approach

**For quickest restoration**: Run `.\restore-database.ps1` 

It will guide you through everything step-by-step with colored output and clear instructions!

---

**Last Updated**: October 15, 2025  
**Your Supabase Project**: fbdqrqknqphcyxbmnuaf  
**Region**: Southeast Asia (Singapore)


