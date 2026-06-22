import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: inbounds } = await supabase.from('freight_inbound').select('*');
  const { data: quotas } = await supabase.from('freight_quotations').select('*');
  const { data: mutations } = await supabase.from('freight_mutation_logs').select('*');

  console.log('--- INBOUND ---');
  inbounds?.forEach(i => console.log(i.pengajuan_number, i.item_code, JSON.stringify(i.items)));

  console.log('--- QUOTATIONS (OUTBOUND) ---');
  quotas?.filter(q => q.type === 'outbound').forEach(q => {
     console.log(q.quotation_number, q.source_pengajuan_number, q.outbound_status, q.document_status, JSON.stringify(q.packages));
  });

  console.log('--- MUTATIONS ---');
  mutations?.forEach(m => console.log(m.destination, m.pengajuan_number, m.item_code, m.quantity));
}

check();
