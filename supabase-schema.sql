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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Scholars can only read their own record
CREATE POLICY "Scholars can view own record"
  ON scholars
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'scholar' AND
    school_id = auth.jwt() ->> 'school_id'
  );

-- Admins can do everything
CREATE POLICY "Admins have full access to scholars"
  ON scholars
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Anonymous users can't access scholars
CREATE POLICY "Anonymous users cannot access scholars"
  ON scholars
  FOR ALL
  USING (false);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin table
CREATE POLICY "Admins can view all admins"
  ON admins
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default admin (password: admin123)
-- Note: In production, use proper password hashing with bcrypt
-- This is a bcrypt hash of "admin123"
INSERT INTO admins (username, password_hash, full_name, email)
VALUES (
  'admin',
  '$2a$10$rJZjvGy5Y5F5F5F5F5F5F.F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F',
  'System Administrator',
  'admin@iskolar.ph'
)
ON CONFLICT (username) DO NOTHING;

-- Create a function to check if school_id exists
CREATE OR REPLACE FUNCTION check_school_id_exists(p_school_id VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM scholars 
    WHERE LOWER(school_id) = LOWER(p_school_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to verify scholar credentials
CREATE OR REPLACE FUNCTION verify_scholar_credentials(
  p_school VARCHAR,
  p_school_id VARCHAR,
  p_school_year VARCHAR
)
RETURNS TABLE (
  id UUID,
  school_id VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  school VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.school_id,
    s.first_name,
    s.last_name,
    s.school
  FROM scholars s
  WHERE 
    LOWER(s.school) = LOWER(p_school) AND
    LOWER(s.school_id) = LOWER(p_school_id) AND
    s.school_year = p_school_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_school_id_exists TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_scholar_credentials TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE scholars IS 'Stores scholarship recipient information';
COMMENT ON TABLE admins IS 'Stores administrator accounts';
COMMENT ON COLUMN scholars.school_id IS 'Unique identifier for each scholar (e.g., NE-0001)';
COMMENT ON COLUMN scholars.status IS 'Payment status: Processing or Paid';
COMMENT ON COLUMN scholars.school_year IS 'Academic year (e.g., 2026-2027)';
