-- FlatFit Simple Database Setup
-- No Supabase Auth - Using custom email/password authentication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS daily_logs;
DROP TABLE IF EXISTS members;

-- Members table with email/password
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '' CHECK (char_length(name) <= 20),
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
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_daily_logs_member_id ON daily_logs(member_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_daily_logs_member_date ON daily_logs(member_id, log_date);

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

-- Disable Row-Level Security (we handle auth in app layer)
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ FlatFit database setup complete!';
  RAISE NOTICE 'Tables created: members, daily_logs';
  RAISE NOTICE 'You can now use the app at http://localhost:3000';
END $$;
