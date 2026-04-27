import { createClient } from '@supabase/supabase-js';

// Usage:
// SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/ensure_locations.mjs

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY). Set env vars and retry.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function ensure() {
  // Define locations to ensure in DB
  const locations = [
    { value: 'gudang', label: 'Gudang', is_exhibition: false, is_default: true },
    { value: 'parkiran', label: 'Parkiran', is_exhibition: false, is_default: false },
  ];

  // Add Hall 1..11 as exhibition locations
  for (let i = 1; i <= 11; i++) {
    locations.push({ value: `hall ${i}`, label: `Hall ${i}`, is_exhibition: true, is_default: false });
  }

  // Upsert into 'locations' table (requires columns: value, label, is_exhibition, is_default)
  try {
    console.log('Upserting locations into Supabase...');
    const { data, error } = await supabase.from('locations').upsert(locations, { onConflict: ['value'] });
    if (error) {
      console.error('Upsert error:', error);
      process.exit(2);
    }
    console.log('Upsert result:', data && data.length ? `${data.length} rows` : 'no rows returned');
    console.log('Done. Your app should pick up these locations via DataContext realtime subscription.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(3);
  }
}

ensure();
