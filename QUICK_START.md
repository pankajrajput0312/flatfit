# 🚀 FlatFit Quick Start

## ✅ What's Done

- ✅ Next.js app built and configured
- ✅ Supabase credentials configured
- ✅ Tailwind CSS + TypeScript set up
- ✅ All components built (Today, Leaderboard, Profile, Onboarding)
- ✅ Database migration file ready

## 🎯 3 Steps to Get Started

### 1️⃣ Run Database Migration (5 minutes)

**Go to Supabase SQL Editor:**
https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql

**Steps:**
1. Click "New Query"
2. Copy ALL contents from: `supabase/migrations/001_initial_schema.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Should see: "Success. No rows returned"

**Enable Email Auth:**
1. Go to Authentication → Providers
2. Toggle Email provider to ON

### 2️⃣ Start the App

```bash
npm run dev
```

Open: http://localhost:3000

### 3️⃣ Sign In & Start Tracking

1. Go to `/login`
2. Create account (email + password)
3. Complete onboarding (name, gym days, targets)
4. Start logging!

**First time users:** Click "Sign Up" and create an account
**Returning users:** Just sign in with your email and password

## 🎮 How to Use

### Today Screen (🏠)
- **Gym**: Tap "Mark as Done" on gym days
- **Water**: Tap droplets to fill (8 total = your daily target)
- **Protein**: Enter grams consumed
- **Points**: Auto-calculated (max 10/day)

### Leaderboard (🏆)
- See all 5 flatmates ranked
- Updates in real-time
- Gold background for 1st place

### Profile (⚙️)
- Edit gym days
- Adjust water/protein targets
- Changes apply immediately

## 📖 Full Documentation

- **DATABASE_SETUP.md** - Detailed migration instructions
- **SETUP_GUIDE.md** - Complete setup guide with troubleshooting
- **README.md** - Project overview and features

## 🐛 Issues?

**Tables don't exist:**
```bash
npm run test-connection
```
If it fails, run the database migration (Step 1)

**Can't sign in:**
- Check Email auth is enabled in Supabase
- Make sure password is at least 6 characters
- Try signing up if you're a new user

**Port 3000 in use:**
```bash
npm run dev -- -p 3001
```

## 🎉 That's It!

You're ready to track fitness with your flatmates!

Add 4 more people:
1. Each person signs in with their email
2. Completes onboarding
3. Starts logging daily

The leaderboard updates in real-time as everyone logs their progress! 🏆
