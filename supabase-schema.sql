-- Iskolar Scholarship Management System - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create scholars table
CREATE TABLE IF NOT EXISTS scholars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  barangay VARCHAR(100) NOT NULL,
  school VARCHAR(255) NOT NULL,
  year_level VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  course VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Processing',
  contact_number VARCHAR(20),
  email VARCHAR(255),
  school_year VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scholars_school_id ON scholars(school_id);
CREATE INDEX IF NOT EXISTS idx_scholars_school ON scholars(school);
CREATE INDEX IF NOT EXISTS idx_scholars_school_year ON scholars(school_year);
CREATE INDEX IF NOT EXISTS idx_scholars_status ON scholars(status);
CREATE INDEX IF NOT EXISTS idx_scholars_year_level ON scholars(year_level);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Create updated_at trigger function (immutable search_path)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_scholars_updated_at ON scholars;
CREATE TRIGGER update_scholars_updated_at
  BEFORE UPDATE ON scholars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on scholars table
ALTER TABLE scholars ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if re-running
DROP POLICY IF EXISTS "Scholars can view own record" ON scholars;
DROP POLICY IF EXISTS "Admins have full access to scholars" ON scholars;
DROP POLICY IF EXISTS "Anonymous users cannot access scholars" ON scholars;

-- Admins (server-managed app_metadata role) can access scholars
-- Note: Run supabase-admin-rls.sql to set up public.admin_users & public.is_admin()
CREATE POLICY "Admins have full access to scholars"
  ON scholars
  FOR ALL
  TO authenticated
  USING (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin')
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- Enable RLS on legacy admins table and block client API access
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE admins FROM public, anon, authenticated;

DROP POLICY IF EXISTS "Admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Deny client access to admins" ON admins;
CREATE POLICY "Deny client access to admins"
  ON admins
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Note: Create administrator accounts securely via Supabase Dashboard -> Authentication -> Users
-- and register them with supabase-admin-rls.sql (never seed hardcoded default passwords).

-- Legacy utility functions restricted strictly to authenticated admins (no anon access)
CREATE OR REPLACE FUNCTION public.check_school_id_exists(p_school_id VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.scholars
    WHERE LOWER(school_id) = LOWER(p_school_id)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_school_id_exists(VARCHAR) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_school_id_exists(VARCHAR) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE scholars IS 'Stores scholarship recipient information';
COMMENT ON TABLE admins IS 'Stores administrator accounts';
COMMENT ON COLUMN scholars.school_id IS 'Unique identifier for each scholar (e.g., NE-0001)';
COMMENT ON COLUMN scholars.status IS 'Payment status: Processing or Paid';
COMMENT ON COLUMN scholars.school_year IS 'Academic year (e.g., 2026-2027)';
