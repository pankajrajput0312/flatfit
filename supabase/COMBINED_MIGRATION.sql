-- FlatFit Complete Database Setup
-- Generated: 2026-05-28T19:08:41.344Z


-- ====================================
-- Migration: 001_initial_schema.sql
-- ====================================

-- FlatFit Database Schema
-- Creates tables for members and daily logs with Row-Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 20),
  gym_days INTEGER[] DEFAULT '{}',
  water_target_l NUMERIC(3,1) NOT NULL DEFAULT 2.0 CHECK (water_target_l >= 1.0 AND water_target_l <= 5.0),
  protein_target_g INTEGER NOT NULL DEFAULT 120 CHECK (protein_target_g >= 50 AND protein_target_g <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  gym_done BOOLEAN NOT NULL DEFAULT FALSE,
  water_droplets SMALLINT NOT NULL DEFAULT 0 CHECK (water_droplets >= 0 AND water_droplets <= 8),
  protein_g INTEGER NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, log_date)
);

-- Create indexes for performance
CREATE INDEX idx_daily_logs_member_id ON daily_logs(member_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_daily_logs_member_date ON daily_logs(member_id, log_date);
CREATE INDEX idx_members_user_id ON members(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row-Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members table
-- Anyone can view all members (for leaderboard)
CREATE POLICY "members_select_all"
  ON members FOR SELECT
  USING (true);

-- Users can only insert/update their own member record
CREATE POLICY "members_insert_own"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_update_own"
  ON members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_logs table
-- Anyone can view all daily logs (for leaderboard)
CREATE POLICY "daily_logs_select_all"
  ON daily_logs FOR SELECT
  USING (true);

-- Users can only insert/update their own logs
CREATE POLICY "daily_logs_insert_own"
  ON daily_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "daily_logs_update_own"
  ON daily_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_id
      AND members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_id
      AND members.user_id = auth.uid()
    )
  );

-- Users can delete their own logs
CREATE POLICY "daily_logs_delete_own"
  ON daily_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_id
      AND members.user_id = auth.uid()
    )
  );



-- ====================================
-- Migration: 002_simple_auth.sql
-- ====================================

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


