-- Fix Supabase Row Level Security (RLS) Policies for Lost & Found App
-- Run this SQL in your Supabase SQL Editor

-- First, check if RLS is enabled on items table
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'items';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON items;
DROP POLICY IF EXISTS "Allow public insert access" ON items;
DROP POLICY IF EXISTS "Allow public update access" ON items;
DROP POLICY IF EXISTS "Allow public delete access" ON items;

-- Create comprehensive RLS policies that allow all operations
CREATE POLICY "Allow public read access" ON items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON items FOR DELETE USING (true);

-- Make sure RLS is enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'items';

-- Test the permissions by selecting from the table
SELECT id, title, type, created_at FROM items LIMIT 5;