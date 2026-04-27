import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: locs } = await supabase.from('locations').select('*');
  console.log("Locations:", locs);
  
  const { data: logs } = await supabase.from('freight_mutation_logs').select('origin, destination').limit(20);
  console.log("Sample Mut Logs:", logs);
}

check();
