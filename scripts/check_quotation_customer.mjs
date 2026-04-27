import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Get quotation data for customer field
const { data: q } = await supabase.from('freight_quotations').select('id, pengajuan_number, customer, packages, bl_number, bl_date').limit(5);
q?.forEach(r => {
  console.log(`Quotation: ${r.id}`);
  console.log('  customer:', r.customer);
  console.log('  bl_number:', r.bl_number);
  const pkgs = r.packages || [];
  pkgs.forEach(p => {
    if (p.items && p.items[0]) {
      console.log('  pkg item:', JSON.stringify(p.items[0]).substring(0, 120));
    }
  });
});
