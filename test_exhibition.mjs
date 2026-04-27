import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: locs } = await supabase.from('locations').select('*');
  console.log("Locations table:", locs);
  
  const isExhibitionLocation = (val) => {
      if (!val) return false;
      const v = String(val).toLowerCase();
      if (locs && locs.length) {
          const found = locs.find(l => String(l.value).toLowerCase() === v || String(l.label).toLowerCase() === v);
          if (found) return !!found.is_exhibition || String(found.value).toLowerCase().includes('hall') || String(found.label).toLowerCase().includes('hall');
          return v.includes('hall') || v.includes('pameran');
      }
      return v.includes('hall') || v.includes('pameran');
  };

  console.log("isExhibitionLocation('Hall 1'):", isExhibitionLocation('Hall 1'));
  console.log("isExhibitionLocation('Hall 7'):", isExhibitionLocation('Hall 7'));
  console.log("isExhibitionLocation('warehouse'):", isExhibitionLocation('warehouse'));
}

check();
