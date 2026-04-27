import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const { data, error } = await supabase.from('freight_inbound').select('*').limit(3);
if (error) console.error(error);
else if (data.length > 0) {
  console.log('=== freight_inbound columns ===');
  console.log(Object.keys(data[0]));
  console.log('\n=== Sample record ===');
  const r = data[0];
  console.log('pengajuan_number:', r.pengajuan_number);
  console.log('receipt_number:', r.receipt_number);
  console.log('receipt_date:', r.receipt_date);
  console.log('customer:', r.customer);
  console.log('sender:', r.sender);
  console.log('item_code:', r.item_code);
  console.log('asset_name:', r.asset_name);
  console.log('unit:', r.unit);
  console.log('quantity:', r.quantity);
  console.log('date:', r.date);
  
  if (r.documents) {
    const docs = typeof r.documents === 'string' ? JSON.parse(r.documents) : r.documents;
    console.log('\ndocuments keys:', typeof docs === 'object' && !Array.isArray(docs) ? Object.keys(docs) : 'array');
    if (docs.items && docs.items[0]) console.log('first item keys:', Object.keys(docs.items[0]));
  }
}

// Check for receipt_number / customer / owner availability
const { data: allRows } = await supabase.from('freight_inbound').select('*');
console.log('\n=== All records overview ===');
allRows?.forEach((r, i) => {
  const docs = typeof r.documents === 'string' ? JSON.parse(r.documents) : (r.documents || {});
  const items = docs.items || [];
  console.log(`\n[${i+1}] ${r.pengajuan_number}`);
  console.log('  receipt_number:', r.receipt_number);
  console.log('  sender:', r.sender);
  console.log('  item_code:', r.item_code);
  console.log('  asset_name:', r.asset_name);
  console.log('  unit:', r.unit);
  console.log('  items count:', items.length);
  if (items[0]) {
    console.log('  first item:', items[0].assetName || items[0].goodsType, '| code:', items[0].itemCode, '| unit:', items[0].unit, '| qty:', items[0].quantity);
  }
});
