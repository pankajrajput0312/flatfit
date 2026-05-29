-- Simple Authentication Schema
-- Add password field to members table and remove Supabase Auth dependency

-- First, drop all RLS policies that reference auth.uid()
DROP POLICY IF EXISTS "members_insert_own" ON members;
DROP POLICY IF EXISTS "members_update_own" ON members;
DROP POLICY IF EXISTS "daily_logs_insert_own" ON daily_logs;
DROP POLICY IF EXISTS "daily_logs_update_own" ON daily_logs;
DROP POLICY IF EXISTS "daily_logs_delete_own" ON daily_logs;

-- Remove user_id foreign key constraint from members
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_user_id_fkey;
ALTER TABLE members DROP COLUMN IF EXISTS user_id;

-- Add email and password fields to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make email and password required for new records
ALTER TABLE members ALTER COLUMN email SET NOT NULL;
ALTER TABLE members ALTER COLUMN password_hash SET NOT NULL;

-- Disable RLS temporarily (we'll handle auth in the app layer)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Update members table structure to be simpler
-- Now members table has: id, email, password_hash, name, gym_days, water_target_l, protein_target_g
