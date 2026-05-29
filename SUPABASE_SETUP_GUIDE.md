# 🎯 Supabase Setup & Migration Guide

## ✅ API Test Results

**Good news!** All APIs are working correctly:

```bash
✅ Signup API: http://localhost:3002/api/auth/signup
✅ Login API: http://localhost:3002/api/auth/login
✅ Dev Server: Running on port 3002
✅ Components: All working
```

**Why signup fails:** Database tables don't exist yet (we need to run the migration)

---

## 📋 Step-by-Step Migration Instructions

### Step 1: Open Supabase SQL Editor

Click this link (it will open in your browser):

**https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql**

- Make sure you're logged into Supabase
- You should see your project dashboard

### Step 2: Create New Query

1. Look for the **"New Query"** button (top right corner, green button)
2. Click it
3. A blank SQL editor will appear

### Step 3: Copy the Migration SQL

**Option A: From clipboard (if it's still there)**
- Just press **Cmd+V** (Mac) or **Ctrl+V** (Windows)

**Option B: Copy manually**
Run this command in your terminal:
```bash
cat supabase/SIMPLE_SETUP.sql | pbcopy
```
Then paste in the SQL editor

**Option C: Copy from file**
1. Open the file: `supabase/SIMPLE_SETUP.sql`
2. Select all (Cmd+A)
3. Copy (Cmd+C)  
4. Paste in SQL editor (Cmd+V)

### Step 4: Run the Migration

1. You should see SQL code in the editor (about 70 lines)
2. Click the **"Run"** button (green button, bottom right)
3. Wait 2-3 seconds

### Step 5: Verify Success

You should see these messages at the bottom:

```
NOTICE: ✅ FlatFit database setup complete!
NOTICE: Tables created: members, daily_logs
NOTICE: You can now use the app at http://localhost:3000
```

✅ **That's it!** The migration is complete!

---

## 🧪 Test the Migration

Run this in your terminal:

```bash
npm run test-connection
```

**Expected output:**
```
✅ Members table exists
   Found 0 members

✅ Daily logs table exists
   Found 0 logs

🎉 Connection successful! Database is ready.
```

---

## 🚀 Use the App

### 1. Open the App

```bash
# Server should already be running on:
open http://localhost:3002/login
```

### 2. Sign Up

1. Click **"Don't have an account? Sign Up"**
2. Enter:
   - Email: `your@email.com`
   - Password: `test123` (or anything 6+ characters)
3. Click **"Create Account"**

### 3. Complete Onboarding

Step 1: Enter your name
Step 2: Select gym days (Mon-Sun)
Step 3: Set water & protein targets

### 4. Start Tracking!

You'll land on the Today screen where you can:
- Mark gym as done
- Tap water droplets
- Enter protein grams
- See your score update in real-time

---

## 📊 What the Migration Creates

### Tables Created:

**1. members**
```sql
- id (UUID)
- email (unique)
- password_hash
- name
- gym_days (array)
- water_target_l
- protein_target_g
- created_at, updated_at
```

**2. daily_logs**
```sql
- id (UUID)
- member_id (FK to members)
- log_date
- gym_done
- water_droplets (0-8)
- protein_g
- created_at, updated_at
```

### Features:
- ✅ Password hashing (bcrypt)
- ✅ Auto-update timestamps
- ✅ Unique constraint (one log per member per day)
- ✅ Fast indexes on email, member_id, log_date
- ✅ No Row-Level Security (we handle auth in app)

---

## 🐛 Troubleshooting

### "Permission denied" when running SQL

**Solution:** Make sure you're logged into the correct Supabase account
- Go to https://supabase.com
- Click your profile picture
- Verify you're logged in
- Try the SQL editor link again

### Can't find "New Query" button

**Solution:** You might be on the wrong page
- Make sure you're at: `/sql` (not `/editor` or `/database`)
- The correct URL is: `https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql`

### SQL runs but no success message

**Solution:** Check the "Results" panel at the bottom
- You might need to scroll down
- Look for "NOTICE" messages
- If you see errors, copy them and let me know

### "Table already exists" error

**Solution:** Tables were already created
- This is fine! The migration already ran
- Skip to "Test the Migration" section
- Run `npm run test-connection` to verify

### Still seeing "Failed to create account"

**Checklist:**
1. Did the SQL run successfully? (check for NOTICE messages)
2. Did `npm run test-connection` show ✅?
3. Is dev server running? (`npm run dev`)
4. Using correct URL? (check port - might be 3000, 3001, or 3002)

---

## 📝 Quick Reference

### Commands

```bash
# Copy migration SQL to clipboard
cat supabase/SIMPLE_SETUP.sql | pbcopy

# Test database connection
npm run test-connection

# Start dev server
npm run dev

# Check which port server is on
lsof -ti:3000,3001,3002

# View server logs
tail -f /tmp/next-dev.log
```

### URLs

```
Supabase SQL Editor:
https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql

App (check actual port in terminal):
http://localhost:3000  (or 3001 or 3002)
```

### Files

```
Migration SQL:  supabase/SIMPLE_SETUP.sql
Env Config:     .env.local
Test Script:    scripts/test-connection.js
```

---

## ✅ Success Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Clicked "New Query"
- [ ] Pasted migration SQL
- [ ] Clicked "Run"
- [ ] Saw success NOTICE messages
- [ ] Ran `npm run test-connection` - passed ✅
- [ ] Opened app at http://localhost:3002
- [ ] Successfully signed up
- [ ] Completed onboarding
- [ ] Can log gym/water/protein

---

## 🎉 After Migration

Once migration is complete, you can:

1. **Sign up 5 flatmates**
   - Each person creates their own account
   - Each completes onboarding

2. **Track daily**
   - Log gym sessions
   - Track water intake (8 droplets)
   - Enter protein consumption

3. **Compete on leaderboard**
   - Real-time updates
   - Rankings based on percentage completion
   - See everyone's progress

4. **Customize targets**
   - Go to Profile tab
   - Edit gym days
   - Adjust water/protein targets

---

## 💡 Need Help?

If you get stuck:

1. Check the troubleshooting section above
2. Run `npm run test-connection` to see what's working
3. Check server logs: `tail -f /tmp/next-dev.log`
4. Make sure you're using the correct port (might be 3002 not 3000)

**The migration is just copy + paste + click Run!** ✨

