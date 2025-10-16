-- Complete Database Setup for Lost & Found App
-- Run this SQL in your Supabase SQL Editor

-- 1. First, let's check the current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'items' AND table_schema = 'public';

-- 2. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'items';

-- 3. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access" ON items;
DROP POLICY IF EXISTS "Allow public insert access" ON items;
DROP POLICY IF EXISTS "Allow public update access" ON items;
DROP POLICY IF EXISTS "Allow public delete access" ON items;
DROP POLICY IF EXISTS "Enable read access for all users" ON items;
DROP POLICY IF EXISTS "Enable insert for all users" ON items;
DROP POLICY IF EXISTS "Enable update for all users" ON items;
DROP POLICY IF EXISTS "Enable delete for all users" ON items;

-- 4. Create comprehensive RLS policies that allow ALL operations
CREATE POLICY "Allow all operations for everyone" ON items 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Alternative: If the above doesn't work, create separate policies
CREATE POLICY "Enable read for all" ON items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all" ON items FOR DELETE USING (true);

-- 5. Enable RLS on the table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions to anon role (used by your app)
GRANT ALL ON TABLE items TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- 7. Also grant to authenticated role (for future use)
GRANT ALL ON TABLE items TO authenticated;

-- 8. Test delete operation with a simple query
-- (This won't actually delete anything, just tests permissions)
SELECT 'DELETE permission test' as test_name, 
       CASE 
           WHEN has_table_privilege('anon', 'items', 'DELETE') 
           THEN 'GRANTED' 
           ELSE 'DENIED' 
       END as delete_permission;

-- 9. Verify all policies are created correctly
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies 
WHERE tablename = 'items'
ORDER BY cmd;

-- 10. Show current table permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'items' AND table_schema = 'public';

-- 11. Test query - this should work if permissions are correct
SELECT COUNT(*) as total_items FROM items;

-- Success message
SELECT 'Database setup complete! Delete operations should now work.' as status;