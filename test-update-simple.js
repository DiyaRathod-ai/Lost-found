// Simple Update Test Script
// Run this in browser console to test update functionality

async function testUpdateSimple() {
    console.log('🧪 Simple Update Test Starting...');
    console.log('='.repeat(50));

    // Get items
    const items = await window.storage.getItems();
    console.log(`Found ${items.length} items`);

    if (items.length === 0) {
        console.log('❌ No items to test update on');
        return;
    }

    const testItem = items[0];
    console.log('🎯 Testing update on:', testItem.title, 'ID:', testItem.id);

    // Create updates
    const updates = {
        title: testItem.title + ' (UPDATED)',
        description: testItem.description + ' [Updated for testing]',
        location: testItem.location + ' - Updated Location',
        reporterName: testItem.reporterName,
        reporterEmail: testItem.reporterEmail,
        category: testItem.category
    };

    console.log('📝 Updates to apply:', updates);

    // Perform update
    const updateResult = await window.storage.updateItem(testItem.id, updates);
    console.log('Update result:', updateResult);

    if (updateResult) {
        console.log('✅ Update successful!');
        console.log('New title:', updateResult.title);
        console.log('New description:', updateResult.description);
        
        // Verify by getting items again
        const itemsAfter = await window.storage.getItems();
        const updatedItem = itemsAfter.find(item => item.id === testItem.id);
        
        if (updatedItem && updatedItem.title === updates.title) {
            console.log('✅ Update verified! Item was successfully updated.');
        } else {
            console.log('❌ Update verification failed!');
        }
    } else {
        console.log('❌ Update failed!');
    }

    console.log('='.repeat(50));
}

// Make function available globally
window.testUpdateSimple = testUpdateSimple;

// Instructions
console.log('🧪 Simple update test loaded!');
console.log('Run: testUpdateSimple()');
console.log('');
console.log('💡 Make sure you ran the emergency SQL script first:');
console.log('   emergency-fix-delete.sql in Supabase SQL Editor');