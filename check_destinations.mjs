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
  const { data: logs } = await supabase.from('freight_mutation_logs').select('origin, destination');
  
  const origins = [...new Set(logs.map(l => l.origin))];
  const destinations = [...new Set(logs.map(l => l.destination))];
  
  console.log("Origins:", origins);
  console.log("Destinations:", destinations);
}

check();
