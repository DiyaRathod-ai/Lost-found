// Test Edit and Delete Functionality
// Run this in browser console to test edit/delete operations

async function testEditDelete() {
    console.log('🧪 Testing Edit and Delete functionality...');
    console.log('='.repeat(50));

    // First, get all items to find one to test with
    console.log('1. Getting all items...');
    const items = await window.storage.getItems();
    console.log(`Found ${items.length} items:`, items);

    if (items.length === 0) {
        console.log('❌ No items found to test with');
        return;
    }

    const testItem = items[0];
    console.log('📝 Using item for testing:', testItem);

    // Test Update
    console.log('\n2. Testing UPDATE operation...');
    const updates = {
        title: testItem.title + ' (UPDATED)',
        description: testItem.description + ' [This item was updated for testing]',
        reporterName: testItem.reporterName,
        reporterEmail: testItem.reporterEmail,
        category: testItem.category,
        location: testItem.location
    };

    try {
        const updatedItem = await window.storage.updateItem(testItem.id, updates);
        if (updatedItem) {
            console.log('✅ UPDATE successful:', updatedItem);
        } else {
            console.log('❌ UPDATE failed: null result');
        }
    } catch (error) {
        console.log('❌ UPDATE error:', error);
    }

    // Test Delete (with confirmation)
    console.log('\n3. Testing DELETE operation...');
    const confirmDelete = confirm(`Do you want to test DELETE on "${testItem.title}"?\n\nThis will permanently remove the item from the database.\n\nClick OK to proceed or Cancel to skip.`);
    
    if (confirmDelete) {
        try {
            const deleteResult = await window.storage.deleteItem(testItem.id);
            if (deleteResult) {
                console.log('✅ DELETE successful');
                
                // Verify item is gone
                const remainingItems = await window.storage.getItems();
                const itemStillExists = remainingItems.find(item => item.id === testItem.id);
                if (itemStillExists) {
                    console.log('⚠️ WARNING: Item still exists after delete!');
                } else {
                    console.log('✅ Item successfully removed from database');
                }
            } else {
                console.log('❌ DELETE failed: false result');
            }
        } catch (error) {
            console.log('❌ DELETE error:', error);
        }
    } else {
        console.log('⏭️ DELETE test skipped by user');
    }

    // Test direct Supabase operations
    console.log('\n4. Testing direct Supabase operations...');
    if (window.supabaseClient && window.supabaseClient.isConfigured()) {
        const client = window.supabaseClient.getClient();
        
        // Test direct update
        console.log('Testing direct Supabase UPDATE...');
        try {
            const { data, error } = await client
                .from('items')
                .update({ title: 'Direct Update Test' })
                .eq('id', items[1]?.id)
                .select();
                
            if (error) {
                console.log('❌ Direct Supabase UPDATE error:', error);
            } else {
                console.log('✅ Direct Supabase UPDATE successful:', data);
            }
        } catch (error) {
            console.log('❌ Direct Supabase UPDATE exception:', error);
        }
    }

    console.log('\n='.repeat(50));
    console.log('🎯 Test complete. Check the results above.');
}

// Make function available globally
window.testEditDelete = testEditDelete;

// Show instructions
console.log('🧪 Edit/Delete test script loaded!');
console.log('Run: testEditDelete()');
console.log('');
console.log('💡 First, make sure to run the SQL script in Supabase:');
console.log('   Go to your Supabase dashboard → SQL Editor');
console.log('   Copy and run the contents of fix-permissions.sql');