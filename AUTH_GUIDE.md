# 🔐 Authentication Guide

## Updated: Email/Password Authentication

FlatFit now uses simple email and password authentication instead of magic links.

## How It Works

### Sign Up (First Time Users)

1. Go to http://localhost:3000/login
2. Click **"Don't have an account? Sign Up"**
3. Enter:
   - Email address
   - Password (minimum 6 characters)
4. Click **"Create Account"**
5. You'll be redirected to onboarding

### Sign In (Returning Users)

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click **"Sign In"**
4. You'll go directly to the Today screen

## Features

- ✅ **No email verification required** - Instant access
- ✅ **Fast login** - No waiting for emails
- ✅ **Simple signup** - Just email + password
- ✅ **Auto-redirect** - First time → onboarding, returning → today
- ✅ **Secure** - Handled by Supabase Auth

## What Changed

**Before:**
- Magic link sent to email
- Had to check inbox/spam
- Click link to authenticate

**Now:**
- Email + password form
- Instant authentication
- Toggle between Sign Up / Sign In

## Database Setup Required

Before you can sign up, you need to:

1. **Run the database migration** (see DATABASE_SETUP.md)
2. **Enable Email auth in Supabase**:
   - Go to Authentication → Providers
   - Toggle **Email** provider ON
   - **Disable** "Confirm email" (optional, for faster dev)

## Example Flow

### First User (You)

```
1. npm run dev
2. Open http://localhost:3000
3. Redirects to /login
4. Click "Sign Up"
5. Enter: email@example.com / password123
6. Complete onboarding (name, gym days, targets)
7. Land on Today screen
8. Start logging!
```

### Second User (Flatmate)

```
1. Open http://localhost:3000/login
2. Click "Sign Up"
3. Enter their email + password
4. Complete their onboarding
5. Both users now on leaderboard!
```

## Password Requirements

- Minimum: 6 characters
- No maximum (Supabase handles this)
- Can include any characters
- Case sensitive

## Troubleshooting

### "Invalid login credentials"
- Check you're using the right email/password
- Make sure you signed up first (use Sign Up button)
- Password is case-sensitive

### "Email rate limit exceeded"
- You've tried signing up too many times
- Wait a few minutes and try again
- Or use a different email

### "Email already registered"
- This email already has an account
- Use "Sign In" instead of "Sign Up"
- Or use the "Forgot Password" feature (if added)

### Still showing loading screen
- Database migration hasn't been run yet
- See DATABASE_SETUP.md to create tables
- Run: `npm run test-connection` to verify

## Security Notes

- Passwords are hashed by Supabase (bcrypt)
- Sessions are JWT tokens
- Middleware refreshes sessions automatically
- Row-Level Security protects all data
- Users can only edit their own logs

## Optional: Disable Email Confirmation

For faster development, disable email confirmation in Supabase:

1. Go to Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle OFF
4. Users can sign up instantly without email verification

**Note:** Re-enable this in production for security!

## Testing

To test with 5 members:

```bash
# User 1
Email: user1@test.com
Password: test123

# User 2
Email: user2@test.com
Password: test123

# User 3
Email: user3@test.com
Password: test123

# User 4
Email: user4@test.com
Password: test123

# User 5
Email: user5@test.com
Password: test123
```

Each user needs to:
1. Sign up
2. Complete onboarding
3. Start logging

## Migration from Magic Links

If you were using magic links before:

- ✅ No data migration needed
- ✅ Existing users can sign in with password
- ✅ Just need to set a password on first sign in
- ✅ All member data preserved

## Next Steps

1. Run database migration (if not done)
2. Start dev server: `npm run dev`
3. Sign up with email + password
4. Complete onboarding
5. Invite your 4 flatmates!

---

**Quick Test:**

```bash
# 1. Run migration (see DATABASE_SETUP.md)
# 2. Start server
npm run dev

# 3. Open browser
open http://localhost:3000/login

# 4. Sign up
Email: test@example.com
Password: test123

# 5. Complete onboarding
# 6. Start logging!
```

🎉 You're ready to use FlatFit!
