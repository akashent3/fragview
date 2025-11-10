# Setup PostgreSQL with Supabase

## Why Supabase?
- Free tier: 500MB database
- Built-in authentication (we'll use NextAuth instead, but good backup)
- Easy to use
- Generous free tier

## Step 1: Create Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (easiest) or email

## Step 2: Create Project
1. Click "+ New Project"
2. Organization: Create new or use default
3. Project Name: `fragview`
4. Database Password: Click generate (SAVE THIS!)
5. Region: **Mumbai (ap-south-1)** (closest to you)
6. Click "Create new project"
   - Wait 2-3 minutes

## Step 3: Get Connection Strings
1. Click "Project Settings" (gear icon, bottom left)
2. Click "Database" in settings
3. Scroll to "Connection string"
4. You'll see different formats. Copy these:

**Connection Pooling (for Next.js - USE THIS):**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Direct Connection (for migrations):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## Step 4: Test Connection (Optional)
We'll test this later with code, but you can use their SQL Editor:
1. Click "SQL Editor" (left sidebar)
2. Click "+ New query"
3. Type: `SELECT NOW();`
4. Click "Run"
5. Should show current time ✅

## SAVE THESE:
- Pooling URL: postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
- Direct URL: postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
- Project URL: https://xxxxx.supabase.co
- API Keys (for later): Found in "Project Settings" > "API"

✅ PostgreSQL (Supabase) is ready!