# Database Setup Instructions

## ✅ Supabase Configuration Complete

Your `.env.local` file is configured with:
- **Project URL**: https://yegevmpfjxoubpmuanoo.supabase.co
- **Anon Key**: ✅ Configured

## 📊 Run Database Migration

You need to create the database tables. Follow these steps:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard:
   **https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo**

2. Click **"SQL Editor"** in the left sidebar

3. Click **"New Query"** button (top right)

### Step 2: Copy the Migration SQL

1. Open this file in your project:
   ```
   supabase/migrations/001_initial_schema.sql
   ```

2. Copy the ENTIRE contents (all 122 lines)

### Step 3: Run the Migration

1. Paste the SQL into the Supabase SQL Editor

2. Click **"Run"** button (bottom right corner)

3. You should see: ✅ "Success. No rows returned"

### Step 4: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar

2. You should see two tables:
   - ✅ `members`
   - ✅ `daily_logs`

### Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers** in the left sidebar

2. Find **Email** provider

3. Make sure it's **Enabled** (toggle switch should be green)

4. Optional: Enable **Confirm email** if you want email verification

## 🧪 Test the Setup

After running the migration, test your connection:

```bash
npm run test-connection
```

You should see:
```
✅ Members table exists
✅ Daily logs table exists
🎉 Connection successful! Database is ready.
```

## 🚀 Start Using the App

Once the migration is complete:

```bash
npm run dev
```

Then open: **http://localhost:3000**

### First Time Flow:

1. **Sign Up**: Go to `/login`
   - Click "Sign Up"
   - Enter email and password (min 6 characters)
   - Click "Create Account"

2. **Onboarding**: Complete 3 steps
   - Step 1: Enter your name
   - Step 2: Select gym days (Mon-Sun)
   - Step 3: Set water & protein targets

3. **Start Logging**: You'll land on the Today screen
   - Mark gym as done
   - Tap water droplets (8 total)
   - Enter protein grams
   - See your score update in real-time!

4. **Check Leaderboard**: Click 🏆 tab
   - See all members ranked
   - Updates live when anyone logs

## 📋 What the Migration Creates

### Tables

**members**
- Stores user profiles
- Fields: name, gym_days, water_target, protein_target
- Each user creates one member record during onboarding

**daily_logs**
- Stores daily logging data
- Fields: gym_done, water_droplets, protein_g
- One row per member per day
- Unique constraint: (member_id, log_date)

### Security (RLS Policies)

- ✅ Anyone can view all members (for leaderboard)
- ✅ Users can only create/edit their own member profile
- ✅ Users can only create/edit their own daily logs
- ✅ All queries are protected at the database level

### Indexes

Performance indexes created for:
- Daily logs by member
- Daily logs by date
- Daily logs by (member, date) - for fast lookups
- Members by user_id

### Triggers

Auto-update timestamps:
- `updated_at` field automatically updated on every record change

## 🐛 Troubleshooting

### Migration fails with "permission denied"
- Make sure you're logged into the correct Supabase project
- Check you're using the SQL Editor (not the API)

### Tables already exist
- If you've run the migration before, tables might exist
- Either:
  - Drop the existing tables first: `DROP TABLE daily_logs; DROP TABLE members;`
  - Or skip the migration if tables look correct

### "relation does not exist" errors in app
- The migration hasn't been run yet
- Follow the steps above to run the SQL in Supabase dashboard

### Auth errors when signing in
- Make sure Email auth is enabled in Supabase
- Check password is at least 6 characters
- Use "Sign Up" for first time, "Sign In" for returning users
- Try a different email address if needed

## ✅ Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied migration SQL (all 122 lines)
- [ ] Ran migration successfully
- [ ] Verified tables exist in Table Editor
- [ ] Enabled Email auth provider
- [ ] Ran `npm run test-connection` successfully
- [ ] Started dev server: `npm run dev`
- [ ] Signed in via magic link
- [ ] Completed onboarding
- [ ] Logged first day's data
- [ ] Checked leaderboard

## 🎯 What's Next?

After setup:
1. Invite your 4 flatmates (they each need to sign up with their own email)
2. Everyone completes onboarding with their personal targets
3. Start tracking daily and competing on the leaderboard!
4. Deploy to Vercel for easy access from phones

## 💡 Optional: Supabase Agent Skills

If you want AI coding tools to work better with Supabase:

```bash
npx skills add supabase/agent-skills
```

This is completely optional and only useful if you're planning to modify the code.
