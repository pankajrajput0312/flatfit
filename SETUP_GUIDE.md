# FlatFit Setup Guide

## ✅ What's Been Built

Your FlatFit app is complete and ready to use! Here's what was created:

### Features Implemented
- ✅ **Today Screen** - Daily logging for gym, water (8 droplets), and protein
- ✅ **Leaderboard** - Real-time rankings with live updates
- ✅ **Profile** - Edit targets and gym days
- ✅ **Onboarding** - 3-step setup flow for new members
- ✅ **Mobile-First Design** - 390px max width, centered on desktop
- ✅ **Points System** - 10 pts/day (5 gym + 3 protein + 2 water)
- ✅ **Member Switcher** - View any member's data

### Tech Stack
- Next.js 14 (App Router) ✅
- TypeScript ✅
- Tailwind CSS ✅
- Supabase ready (needs configuration) ⚠️

## 🚀 Next Steps

### 1. Set Up Supabase (Required)

The app needs a Supabase backend. Follow these steps:

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization (or create one)
4. Fill in:
   - Project name: `flatfit` (or your choice)
   - Database password: (generate a strong one)
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait ~2 minutes for setup

#### B. Get Your Credentials
1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long key under "Project API keys")

#### C. Configure Environment Variables
1. In your project folder, create `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### D. Run Database Migrations
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the ENTIRE contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the query editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned"

#### E. Enable Authentication
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Optional: Enable **Google** provider for OAuth

### 2. Start the App

```bash
# Make sure you're in the project directory
cd /Users/pankaj/Documents/personal/fitness_tracking

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser!

### 3. Create Your First Member

1. Go to http://localhost:3000/login
2. Enter your email
3. Check your email for the magic link
4. Click the link to sign in
5. Complete onboarding:
   - Enter your name
   - Select gym days
   - Set water & protein targets
6. You'll land on the Today screen!

### 4. Add More Members

For testing with 5 members:
- Use different email addresses
- Or use email+1@gmail.com, email+2@gmail.com tricks
- Each member completes their own onboarding

## 📱 Using the App

### Today Screen (🏠)
- **Score Banner**: Shows your current points (0-10)
- **Gym Card**: Mark gym as done on gym days
- **Water Card**: Tap droplets to log water intake
- **Protein Card**: Enter grams consumed
- **Member Switcher**: Tap names at top to view others

### Leaderboard (🏆)
- See all 5 members ranked by today's points
- Updates in real-time when anyone logs
- Gold background for 1st place
- Points breakdown: 🏋️ gym, 🥩 protein, 💧 water

### Profile (⚙️)
- View your details
- Edit gym days and targets
- Sign out

## 🎯 Points Explained

**Gym** (5 pts max)
- Gym day + marked done = 5.0 pts
- Gym day + not done = 0.0 pts
- Rest day (not in gym days) = 5.0 pts auto

**Protein** (3 pts max)
- Formula: (actual / target) × 3
- Example: 90g / 120g target = 2.3 pts
- Caps at 3.0 even if you exceed target

**Water** (2 pts max)
- Formula: (droplets / 8) × 2
- Each droplet = target ÷ 8 liters
- Example: 6/8 droplets = 1.5 pts

**Total** = Gym + Protein + Water (max 10.0)

## 🐛 Troubleshooting

### "Failed to fetch members"
- Check `.env.local` has correct Supabase credentials
- Verify database migrations ran successfully
- Check browser console (F12) for errors

### "No authenticated user"
- Make sure you've enabled Email auth in Supabase
- Check spam folder for magic link email
- Try signing out and in again

### Real-time not working
- In Supabase dashboard: **Database** → **Replication**
- Make sure Realtime is enabled for `daily_logs` table
- Check browser console for subscription errors

### Port 3000 already in use
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## 🚢 Deployment (Optional)

### Deploy to Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

Auto-deploys on every push to main.

## 📂 Project Structure

```
fitness_tracking/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   │   ├── today/        # Daily logging
│   │   ├── leaderboard/  # Rankings
│   │   ├── profile/      # Settings
│   │   ├── onboarding/   # First-time setup
│   │   └── login/        # Auth
│   ├── components/       # React components
│   ├── lib/              # Utils & Supabase
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database schema
└── public/               # Static files
```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#3B82F6',        // Main blue
  'accent-protein': '#F97316', // Orange
  'accent-water': '#06B6D4',   // Cyan
  // ... add more
}
```

### Adjust Targets Range
Edit onboarding sliders in:
- `src/app/onboarding/page.tsx`
- `src/app/profile/page.tsx`

### Change Max Members
Currently hardcoded to 5, but you can:
- Remove member count limit
- Add invite system
- Implement admin panel

## 🔐 Security Notes

- Row-Level Security (RLS) is enabled
- Members can view all members (for leaderboard)
- Members can ONLY edit their own logs
- Auth handled by Supabase
- API keys are public (anon key is safe for client-side)

## 📝 Next Features (v2 Ideas)

- [ ] Push notifications for daily reminders
- [ ] Weekly/monthly stats and trends
- [ ] Chart visualizations
- [ ] Achievement badges
- [ ] Group challenges
- [ ] HealthKit / Google Fit integration
- [ ] Custom metrics (sleep, steps, etc.)
- [ ] Dark mode

## ❓ Need Help?

Check:
1. README.md for overview
2. This file for setup
3. Browser console (F12) for errors
4. Supabase logs in dashboard

## ✅ Quick Checklist

Before first use:
- [ ] Supabase project created
- [ ] `.env.local` configured
- [ ] Database migrations run
- [ ] Email auth enabled
- [ ] `npm run dev` running
- [ ] Signed in via magic link
- [ ] Onboarding completed

You're ready to go! 🎉
