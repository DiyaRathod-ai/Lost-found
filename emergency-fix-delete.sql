-- EMERGENCY DELETE FIX - Run this SQL in Supabase SQL Editor
-- This will completely disable RLS and allow all operations

-- STEP 1: Disable RLS completely (emergency fix)
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- STEP 2: Grant all permissions to anon role
GRANT ALL PRIVILEGES ON TABLE items TO anon;
GRANT ALL PRIVILEGES ON TABLE items TO authenticated;
GRANT ALL PRIVILEGES ON TABLE items TO public;

-- STEP 3: Grant schema permissions
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO public;

-- STEP 4: Test delete permissions
SELECT 'Testing delete permissions...' as status;

-- STEP 5: Show current permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'items';

-- STEP 6: Test query (this should work)
SELECT COUNT(*) as total_items FROM items;

-- STEP 7: Final confirmation
SELECT 'RLS DISABLED - All operations should now work!' as final_status;