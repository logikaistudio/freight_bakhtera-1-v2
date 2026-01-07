// Debug QuotationManagement Error
// Run this in browser console to see exact error

console.log('%c🔍 QuotationManagement Debug', 'color: #3b82f6; font-size: 16px; font-weight: bold');

// Check if data is loaded
const checkData = () => {
    // This will show in console
    console.group('Data Check');

    // Check localStorage
    const lsQuotations = localStorage.getItem('blink_quotations');
    console.log('localStorage quotations:', lsQuotations ? JSON.parse(lsQuotations).length : 'null');

    // Check if React is loaded
    console.log('React loaded:', typeof React !== 'undefined');

    // Check for errors
    console.log('Check Console tab for red errors');

    console.groupEnd();
};

// Check field structure
const checkFieldStructure = async () => {
    console.group('Field Structure Check');

    // Import supabase  
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
        'https://nkyoszmtyrpdwfjxggmb.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjcxMTYsImV4cCI6MjA1MTA0MzExNn0.GhpLPJQyE7IIlmFStBqKVQ_aKcbgleVzN3LKc3wCPxk'
    );

    const { data, error } = await supabase
        .from('blink_quotations')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Supabase error:', error);
    } else if (data && data.length > 0) {
        console.log('Sample data from Supabase:');
        console.log('Fields:', Object.keys(data[0]));
        console.log('Has total_amount:', 'total_amount' in data[0]);
        console.log('Has totalAmount:', 'totalAmount' in data[0]);
    }

    console.groupEnd();
};

checkData();
checkFieldStructure();

console.log('%c📋 Check above for errors', 'color: #ef4444; font-size: 14px');
