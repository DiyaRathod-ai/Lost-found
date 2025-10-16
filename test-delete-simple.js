// Simple Delete Test Script
// Run this in browser console to test delete functionality

async function testDeleteSimple() {
    console.log('🧪 Simple Delete Test Starting...');
    console.log('='.repeat(50));

    // Get items
    const items = await window.storage.getItems();
    console.log(`Found ${items.length} items`);

    if (items.length === 0) {
        console.log('❌ No items to test delete on');
        return;
    }

    const testItem = items[0];
    console.log('🎯 Testing delete on:', testItem.title, 'ID:', testItem.id);

    // Perform delete
    const deleteResult = await window.storage.deleteItem(testItem.id);
    console.log('Delete result:', deleteResult);

    // Check if it's gone
    const itemsAfter = await window.storage.getItems();
    console.log(`Items after delete: ${itemsAfter.length}`);

    const stillExists = itemsAfter.find(item => item.id === testItem.id);
    if (stillExists) {
        console.log('❌ Item still exists after delete!');
    } else {
        console.log('✅ Item successfully deleted!');
    }

    console.log('='.repeat(50));
}

// Make function available globally
window.testDeleteSimple = testDeleteSimple;

// Instructions
console.log('🧪 Simple delete test loaded!');
console.log('Run: testDeleteSimple()');
console.log('');
console.log('💡 First run the emergency SQL script to fix permissions:');
console.log('   Copy contents of emergency-fix-delete.sql');
console.log('   Run in Supabase SQL Editor');