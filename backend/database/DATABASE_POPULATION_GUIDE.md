# Database Population Guide

This guide will help you populate your Supabase database with realistic sample data for testing and development.

## Prerequisites

1. **Supabase Project Setup**: Make sure your Supabase project is properly configured
2. **Environment Variables**: Ensure your `.env` file contains:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for admin script)
   ```
3. **Database Schema**: Run the `setup-database-integrated.sql` script first to create all tables

## Available Scripts

### 1. **Simple Population Script** (Recommended for most users)
```bash
npm run db:populate-simple
```
- ✅ **Works without existing users**
- ✅ **Generates test user ID automatically**
- ⚠️ **May fail due to RLS policies** (see troubleshooting below)

### 2. **Admin Population Script** (Requires service role key)
```bash
npm run db:populate-admin
```
- ✅ **Bypasses RLS policies**
- ✅ **Works without existing users**
- ✅ **Most reliable option**
- ⚠️ **Requires SUPABASE_SERVICE_ROLE_KEY in .env**

### 3. **User ID Helper Script**
```bash
npm run db:get-users
```
- 🔍 **Finds existing users in your database**
- 💡 **Helps you get real user IDs for production use**

### 4. **Original Population Script** (Requires real user ID)
```bash
npm run db:populate
```
- ⚠️ **Requires you to manually update user ID in script**
- ⚠️ **May fail due to RLS policies**

## Quick Start (Recommended)

### Option 1: Simple Script (Try this first)
```bash
npm run db:populate-simple
```

### Option 2: Admin Script (If simple script fails)
1. Add your service role key to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
2. Run the admin script:
   ```bash
   npm run db:populate-admin
   ```

## What Gets Created

The script will create the following sample data:

### Core Business Data
- **1 Test User** (automatically generated)
- **1 Coffee Chain** (Demo Coffee Chain)
- **2 Outlets** (Demo Outlet 1 & 2)
- **3 Suppliers** (Coffee Masters, Dairy Fresh, Flavor Masters)

### Inventory & Menu
- **5 Inventory Items** (Coffee beans, milk, syrups, cups, chocolate)
- **4 Menu Items** (Espresso, Latte, Cappuccino, Mocha)

### Operations Data
- **3 Staff Members** (John Smith, Sarah Johnson, Mike Wilson)
- **2 Supplier Orders** (delivered and pending)
- **3 Waste Logs** (over-extraction, spillage, expired)
- **2 Sales Transactions** (POS data)

### Analytics & AI
- **2 Analytics Records** (waste and sales data)
- **2 AI Recommendations** (waste reduction and inventory optimization)
- **2 Raw Data Lake Entries** (POS and inventory updates)

### Subscription Plans
- **4 Subscription Plans** (Free, Basic, Pro, Enterprise)

## Data Relationships

The script creates proper relationships between all entities:

- Outlets are linked to the coffee chain
- Inventory items are linked to suppliers and outlets
- Staff members are linked to outlets
- Waste logs are linked to inventory items, staff, and outlets
- Sales data is linked to outlets and raw data
- All data is linked to the test user

## Troubleshooting

### Common Issues

#### 1. **"new row violates row-level security policy"**
**Cause**: RLS policies are preventing data insertion
**Solutions**:
- Use the admin script: `npm run db:populate-admin`
- Or temporarily disable RLS policies in Supabase dashboard
- Or use a real user ID from your auth system

#### 2. **"User not allowed" (when running get-user-id.js)**
**Cause**: Trying to access admin API without proper credentials
**Solution**: This is normal - the script will show alternative methods to find users

#### 3. **"Foreign key constraint failed"**
**Cause**: Tables don't exist or schema is incorrect
**Solution**: Run the database setup script first: `setup-database-integrated.sql`

#### 4. **"Permission denied"**
**Cause**: Incorrect API keys or RLS policies
**Solutions**:
- Check your environment variables
- Use the admin script with service role key
- Verify your Supabase project settings

### Error Messages

- **"Error creating [table]"**: Check if the table exists and has the correct schema
- **"Error creating subscription plan"**: Plans might already exist, this is normal
- **"Error creating user"**: User might already exist, this is normal

### Verification

After running the script, you can verify the data was created by:

1. **Supabase Dashboard**: Check your tables in the Supabase dashboard
2. **Application Testing**: Run your frontend and backend to ensure everything works
3. **API Testing**: Use the API endpoints to fetch data

## Getting Your Service Role Key

If you need to use the admin script:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (not the anon key)
4. Add it to your `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Customization

You can modify the sample data by editing the `sampleData` object in any of the population scripts:

- Add more users, outlets, or suppliers
- Modify inventory items and menu items
- Change waste reasons and quantities
- Adjust sales data and analytics

## Cleanup

To remove all sample data, you can:

1. Delete records from each table manually in Supabase dashboard
2. Or create a cleanup script (not included)

## Next Steps

After populating the database:

1. **Test the Application**: Run your frontend and backend to ensure everything works
2. **Verify Analytics**: Check that the dashboard shows the sample data
3. **Test AI Features**: Verify that recommendations are generated
4. **Add Real Data**: Start adding your actual business data

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your Supabase configuration
3. Ensure all tables exist with the correct schema
4. Check RLS policies if you get permission errors
5. Try the admin script if other methods fail

## Script Comparison

| Script | Pros | Cons | Best For |
|--------|------|------|----------|
| `db:populate-simple` | No setup required, auto-generates user ID | May fail due to RLS | Quick testing |
| `db:populate-admin` | Most reliable, bypasses RLS | Requires service role key | Production setup |
| `db:populate` | Uses real user IDs | Manual setup required | Production with real users |
| `db:get-users` | Helps find existing users | Limited functionality | User discovery |
