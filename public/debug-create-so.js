/**
 * QUICK DEBUG - Create SO Button
 * 
 * Buka Browser Console dan check:
 * 1. Ada error message?
 * 2. Network tab - API call gagal?
 * 3. Status quotation berubah?
 */

// Add this to browser console to test:
console.log('Testing Create SO...');

// Check if handleCreateSO is called
window.debugCreateSO = true;

// Monitor console for:
// - "Error updating quotation status to converted"
// - "Error creating shipment"
// - Network errors

/**
 * COMMON ISSUES:
 *
 * 1. Quotation status update fails
 *    → Check console for Supabase error
 *
 * 2. Shipment insert fails
 *    → Check required fields
 *    → Check FK constraints
 *
 * 3. Button click not registered
 *    → Check modal state
 *    → Check quotation object
 *
 * 4. Silent failure
 *    → Check try/catch blocks
 *    → Look for early returns
 */

// Test manually in console:
/*
const testQuotation = {
    id: 'test-uuid',
    jobNumber: 'JOB-TEST',
    customerName: 'Test',
    totalAmount: 1000,
    currency: 'USD'
};

// Call the function (if exposed)
// handleCreateSO(testQuotation);
*/
