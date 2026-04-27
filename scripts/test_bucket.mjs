import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function run() {
  const { data } = supabase.storage.from('non-existent-bucket').getPublicUrl('some-file.jpg');
  console.log("Data:", data);
}

run();
