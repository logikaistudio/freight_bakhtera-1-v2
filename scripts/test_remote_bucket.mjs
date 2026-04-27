import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
// Need the anon key for nkyoszmtyrpdwfjxggmb. Let me extract it from test3.js
const test3Content = fs.readFileSync('test3.js', 'utf8');
const match = test3Content.match(/createClient\('.*?', '(.*?)'\)/);
const SUPABASE_KEY = match ? match[1] : null;

if (!SUPABASE_KEY) {
  console.log("Could not find key");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) console.error("Error:", error);
  else console.log("Buckets:", data.map(b => b.name));
}

run();
