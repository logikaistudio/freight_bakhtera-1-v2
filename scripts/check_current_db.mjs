import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// check BOTH supabase projects
const PROJECTS = [
  { url: process.env.VITE_SUPABASE_URL, key: process.env.VITE_SUPABASE_ANON_KEY, label: 'NEW (fsxdyk)' },
];

for (const p of PROJECTS) {
  const supabase = createClient(p.url, p.key);
  console.log(`\n=== Project: ${p.label} ===`);
  const { count } = await supabase.from('freight_quotations').select('*', { count: 'exact', head: true });
  console.log('Total quotation records:', count);
  
  const { data } = await supabase.from('freight_quotations').select('id, documents, bc_supporting_documents');
  data?.forEach(row => {
    const docs = [...(row.documents || []), ...(row.bc_supporting_documents || [])];
    if (docs.length > 0) {
      console.log(`  ${row.id}: ${docs.length} docs, storageKey=${docs.some(d=>d.storageKey)}, fileData=${docs.some(d=>d.fileData)}`);
    }
  });
}
