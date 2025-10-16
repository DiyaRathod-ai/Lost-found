-- Create a SQL function to force delete items
-- Run this AFTER the main database setup script

-- Create a function that can delete items bypassing RLS if needed
CREATE OR REPLACE FUNCTION force_delete_item(item_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Attempt to delete the item
    DELETE FROM items WHERE id = item_id;
    
    -- Check how many rows were affected
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Return true if something was deleted
    RETURN deleted_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return false
        RAISE LOG 'Error deleting item %: %', item_id, SQLERRM;
        RETURN FALSE;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION force_delete_item(UUID) TO anon;
GRANT EXECUTE ON FUNCTION force_delete_item(UUID) TO authenticated;

-- Test the function (replace with an actual item ID from your database)
-- SELECT force_delete_item('your-actual-item-id-here');