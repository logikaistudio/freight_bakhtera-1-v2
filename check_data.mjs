import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: inbound, error: err1 } = await supabase.from('freight_inbound').select('*');
  const { data: outbound, error: err2 } = await supabase.from('freight_outbound').select('*');
  const { data: mutations, error: err3 } = await supabase.from('freight_mutation_logs').select('*');
  const { data: warehouse, error: err4 } = await supabase.from('freight_warehouse').select('*');

  console.log('Inbound count:', inbound?.length, err1?.message || 'OK');
  console.log('Outbound count:', outbound?.length, err2?.message || 'OK');
  console.log('Mutations count:', mutations?.length, err3?.message || 'OK');
  console.log('Warehouse count:', warehouse?.length, err4?.message || 'OK');
  
  if (outbound && outbound.length > 0) {
     console.log('Outbound items:', JSON.stringify(outbound[0], null, 2));
  } else {
     console.log('NO OUTBOUND DATA IN freight_outbound. Is the UI writing to it?');
  }
  
  if (mutations && mutations.length > 0) {
     console.log('First 2 mutations:', JSON.stringify(mutations.slice(0,2), null, 2));
  }
}

check();
