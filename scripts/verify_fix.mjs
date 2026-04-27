import { createClient } from '@supabase/supabase-js';

const OLD_URL = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTAzMTYsImV4cCI6MjA4MjI4NjMxNn0.qeCz78VNVEcnjUXgBywdxF9Ju1eZzlRPJa_Ff-_33XQ';
const supabase = createClient(OLD_URL, OLD_KEY);

const { data } = await supabase.from('freight_quotations').select('id, documents').eq('id', 'QT-1777264191569').single();
console.log('Record:', data?.id);
data?.documents?.forEach(d => {
  console.log(`  ${d.name}: hasFileData=${!!d.fileData}, starts="${d.fileData?.substring(0,30)}"`);
});
