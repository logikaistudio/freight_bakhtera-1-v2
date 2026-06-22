import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: inbounds } = await supabase.from('freight_inbound').select('id, pengajuan_number, items');
  const { data: quotas } = await supabase.from('freight_quotations').select('id, quotation_number, source_pengajuan_number, items, packages, type, outbound_status, document_status');
  const { data: mutations } = await supabase.from('freight_mutation_logs').select('id, pengajuan_number, item_code, quantity, destination');

  console.log('--- INBOUND ---');
  inbounds?.forEach(i => console.log(i.pengajuan_number, i.items?.[0]?.itemCode || i.items?.[0]?.item_code));

  console.log('--- QUOTATIONS (OUTBOUND) ---');
  quotas?.filter(q => q.type === 'outbound').forEach(q => {
     console.log(
       'Quote:', q.quotation_number, 
       'Source:', q.source_pengajuan_number, 
       'Status:', q.outbound_status, q.document_status,
       'ItemCodes:', q.packages?.[0]?.items?.map(it => it.itemCode || it.item_code)
     );
  });

  console.log('--- MUTATIONS ---');
  mutations?.forEach(m => console.log('Dest:', m.destination, 'Pengajuan:', m.pengajuan_number, 'Item:', m.item_code, 'Qty:', m.quantity));
}

check();
