import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('freight_quotations')
    .select('*');
  if (error) console.error(error);
  else {
    const q = data.find(d => d.pengajuanNumber === 'BRG2604-000002' || (d.pengajuan_number === 'BRG2604-000002'));
    if (q) {
      console.log('Docs:', JSON.stringify(q.documents, null, 2));
      console.log('BC Docs:', JSON.stringify(q.bcSupportingDocuments || q.bc_supporting_documents, null, 2));
    } else {
      console.log('Not found in', data.length, 'rows');
    }
  }
}

run();
