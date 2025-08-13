# Issue Reporting System - Manual Setup Guide

## Overview
This guide provides step-by-step instructions for manually setting up the issue reporting system database schema in Supabase.

## Prerequisites
- Access to your Supabase project dashboard
- Admin privileges for database operations

## Setup Steps

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (wastewise-30)

### Step 2: Open SQL Editor
1. In your Supabase dashboard, navigate to the **SQL Editor** section
2. Click **New Query** to create a new SQL script

### Step 3: Apply the Database Schema
1. Copy the entire contents of the file `backend/setup-issue-reporting.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 4: Verify Setup
After running the script, verify that the following tables were created:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'issues',
    'issue_categories', 
    'issue_priorities',
    'issue_statuses',
    'issue_comments',
    'issue_history',
    'issue_templates'
)
ORDER BY table_name;
```

### Step 5: Verify Default Data
Check that default data was inserted:

```sql
-- Check categories
SELECT * FROM issue_categories;

-- Check priorities  
SELECT * FROM issue_priorities;

-- Check statuses
SELECT * FROM issue_statuses;

-- Check templates
SELECT * FROM issue_templates;
```

## Expected Results

### Tables Created
- `issues` - Main issues table
- `issue_categories` - Issue categories (bug, feature_request, etc.)
- `issue_priorities` - Priority levels (critical, high, medium, low)
- `issue_statuses` - Status values (open, in_progress, resolved, etc.)
- `issue_comments` - Comments and updates on issues
- `issue_history` - Audit trail for issue changes
- `issue_templates` - Templates for common issue types

### Default Data
- **Categories**: bug, feature_request, ui_ux, performance, data, integration, billing, general
- **Priorities**: critical, high, medium, low
- **Statuses**: open, in_progress, waiting_for_user, resolved, closed, duplicate, wont_fix
- **Templates**: Bug Report, Feature Request, Performance Issue

### Functions Created
- `get_user_issue_stats(user_uuid)` - Get issue statistics for a user
- `get_user_issues_by_status(user_uuid)` - Get issues grouped by status

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure you have admin access to the Supabase project
   - Check that RLS policies are properly configured

2. **Duplicate Key Errors**
   - The script uses `ON CONFLICT DO NOTHING` to handle duplicates
   - If you get duplicate key errors, the data may already exist

3. **Foreign Key Errors**
   - Ensure the `outlets` table exists (referenced by `issues.outlet_id`)
   - Ensure the `auth.users` table exists (referenced by user_id fields)

### Verification Commands

```sql
-- Check table structure
\d issues
\d issue_categories
\d issue_priorities
\d issue_statuses

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'issue%';

-- Check functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%issue%';
```

## Next Steps

After successful setup:

1. **Test the API endpoints**:
   - Start your backend server
   - Test the `/api/issues` endpoints

2. **Test the frontend**:
   - Navigate to `/issues` in your application
   - Try creating a test issue

3. **Configure additional settings**:
   - Set up email notifications for issue updates
   - Configure file upload limits for attachments
   - Set up automated issue assignment rules

## Support

If you encounter any issues during setup:

1. Check the Supabase logs in the dashboard
2. Verify all environment variables are correctly set
3. Ensure your backend is properly configured to connect to Supabase
4. Test the database connection using the Supabase client

## Files Modified

The following files were created/modified for the issue reporting system:

- `backend/setup-issue-reporting.sql` - Database schema
- `backend/services/issueReportingService.js` - Backend service
- `backend/routes/issues.js` - API routes
- `backend/index.js` - Route integration
- `frontend/src/components/UI/IssueReporting.tsx` - Frontend component
- `frontend/src/App.tsx` - Route and navigation integration
- `frontend/src/services/api.ts` - API service updates
- `ISSUE_REPORTING_SYSTEM_GUIDE.md` - Complete documentation
