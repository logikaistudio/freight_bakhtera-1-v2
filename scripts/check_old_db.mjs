import { createClient } from '@supabase/supabase-js';

const OLD_URL = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTAzMTYsImV4cCI6MjA4MjI4NjMxNn0.qeCz78VNVEcnjUXgBywdxF9Ju1eZzlRPJa_Ff-_33XQ';

const supabase = createClient(OLD_URL, OLD_KEY);

async function run() {
  console.log('=== Checking OLD Supabase project ===');
  
  const { data, error } = await supabase.from('freight_quotations').select('id, documents, bc_supporting_documents').limit(20);
  if (error) { console.error('DB Error:', error.message); return; }
  
  console.log('Total records:', data.length);
  data.forEach(row => {
    const docs = [...(row.documents || []), ...(row.bc_supporting_documents || [])];
    if (docs.length > 0) {
      console.log(`  ${row.id}: ${docs.length} docs`);
      docs.forEach(d => {
        console.log(`    - ${d.name}: storageKey=${!!d.storageKey}, fileData=${!!d.fileData}, url=${!!d.url}`);
        if (d.url) console.log(`      URL: ${d.url.substring(0,80)}`);
      });
    }
  });
  
  // Check buckets
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('\nBuckets:', buckets?.map(b => b.name));
}

run();
