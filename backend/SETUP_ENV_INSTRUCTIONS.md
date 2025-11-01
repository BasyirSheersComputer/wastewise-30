# ⚠️ URGENT: Setup Environment Variables

## You need to create a `.env` file to restore the database!

### Step 1: Get Your Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/settings/api
2. Scroll down to **"Project API keys"**
3. Find the **`service_role`** key (NOT the `anon` key!)
4. Copy the key (it starts with `eyJ...`)

### Step 2: Create .env File

Create a file named `.env` in the `backend/` folder with this content:

```env
# Supabase Configuration
SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_FROM_STEP1_HERE

# Server Configuration  
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
```

**Important**: Replace `YOUR_SERVICE_ROLE_KEY_FROM_STEP1_HERE` with your actual service role key!

### Step 3: Run Database Restoration

After creating the `.env` file, run:

```powershell
cd backend
node database/restore-database-complete.js
```

### Alternative: Manual SQL Execution (If above doesn't work)

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/sql/new
2. Open file: `backend/database/setup-database-integrated.sql`
3. Copy ALL the content (Ctrl+A, Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click "RUN" button

This will restore all 14+ tables!

### Quick PowerShell Command to Create .env

You can also run this in PowerShell (from project root):

```powershell
@"
SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=wastewise-secret-key-2024
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
```

Then edit `backend\.env` and replace the `SUPABASE_SERVICE_ROLE_KEY` value!


