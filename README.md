# FlatFit - Fitness Tracking for Flatmates

A mobile-first web app for tracking gym, water intake, and protein consumption with your flatmates. Built with Next.js and Supabase.

## Features

- **Daily Logging**: Track gym sessions, water intake (8 droplets), and protein consumption
- **Points System**: Earn up to 10 points per day (5 gym + 3 protein + 2 water)
- **Real-time Leaderboard**: See live rankings of all flatmates
- **Member Switcher**: View any member's data from one device
- **Mobile-First**: Optimized for 390px viewport, works on all devices
- **Personalized Targets**: Set custom daily goals for water and protein

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fitness_tracking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to find your credentials
3. Copy `.env.local.example` to `.env.local` and add your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run database migrations

In your Supabase dashboard:
1. Go to SQL Editor
2. Create a new query
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query

This will create:
- `members` table (user profiles)
- `daily_logs` table (daily tracking data)
- Row-Level Security policies
- Indexes and triggers

### 5. Enable Authentication

In Supabase dashboard:
1. Go to Authentication > Providers
2. Enable Email provider (or Google OAuth)
3. For Email: Configure email templates if needed

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fitness_tracking/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── today/        # Daily logging screen
│   │   ├── leaderboard/  # Real-time leaderboard
│   │   ├── profile/      # User profile & settings
│   │   └── onboarding/   # First-time setup
│   ├── components/       # React components
│   │   ├── layout/       # Navigation & containers
│   │   ├── today/        # Logging cards
│   │   ├── leaderboard/  # Rank cards
│   │   └── ui/           # Base UI components
│   ├── lib/              # Utilities & Supabase clients
│   ├── hooks/            # React hooks
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database schema
└── public/               # Static assets
```

## Usage

### First Time Setup

1. Sign up with email and password
2. Complete onboarding:
   - Enter your name
   - Select gym days (Mon-Sun)
   - Set water target (1-5L)
   - Set protein target (50-300g)

### Daily Usage

**Today Screen (🏠)**
- View your score banner (0-10 points)
- Mark gym as done (5 pts on gym days, auto 5 pts on rest days)
- Tap water droplets to log intake (each droplet = target/8)
- Enter protein consumed in grams
- Switch between members using top pill tabs

**Leaderboard Screen (🏆)**
- See all members ranked by today's points
- View breakdown: 🏋️ gym, 🥩 protein, 💧 water
- Updates in real-time when anyone logs

**Profile Screen (⚙️)**
- View your details
- Edit gym days and targets
- Changes apply immediately to today's scoring

## Points Calculation

- **Gym**: 5 pts if completed on a gym day, 0 if not; auto 5 pts on rest days
- **Protein**: (actual / target) × 3, capped at 3.0
- **Water**: (droplets / 8) × 2, capped at 2.0
- **Total**: Sum of all three, displayed to 1 decimal place

Example:
- Gym done on gym day: 5.0 pts
- 90g protein (target 120g): 2.3 pts
- 5/8 water glasses: 1.3 pts
- **Total: 8.6 / 10**

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app will auto-deploy on every push to main.

## Development

### Run in development mode
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Lint code
```bash
npm run lint
```

## Database Schema

### members
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `name` (text, max 20 chars)
- `gym_days` (int[]) - Array of day indices (0=Mon, 6=Sun)
- `water_target_l` (numeric, 1.0-5.0)
- `protein_target_g` (integer, 50-300)

### daily_logs
- `id` (uuid, PK)
- `member_id` (uuid, FK to members)
- `log_date` (date)
- `gym_done` (boolean)
- `water_droplets` (smallint, 0-8)
- `protein_g` (integer)
- **UNIQUE**: (member_id, log_date)

## Security

- Row-Level Security (RLS) enabled on all tables
- Members can view all members (for leaderboard)
- Members can only modify their own logs
- Realtime subscriptions filtered to current day

## Troubleshooting

**"Failed to fetch members"**
- Check Supabase credentials in `.env.local`
- Verify database migrations ran successfully
- Check browser console for specific errors

**"No authenticated user"**
- Authentication flow needs to be implemented
- For development, you can temporarily disable auth checks

**Real-time updates not working**
- Ensure Supabase Realtime is enabled in project settings
- Check browser console for subscription errors

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

MIT
