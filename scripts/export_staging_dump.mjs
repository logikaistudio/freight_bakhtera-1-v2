import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function dumpTable(tableName, outDir) {
  console.log(`Fetching all rows from ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) throw error;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${tableName}-backup-${timestamp}.json`;
  const outPath = path.resolve(outDir, fileName);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${data.length} rows to ${outPath}`);
  return outPath;
}

async function main() {
  try {
    const outDir = path.resolve(process.cwd(), 'scripts', 'backups');
    // Tables to snapshot - adjust if you want more
    const tables = ['freight_quotations', 'mutation_logs', 'freight_outbound'];
    const results = [];
    for (const t of tables) {
      try {
        const p = await dumpTable(t, outDir);
        results.push(p);
      } catch (err) {
        console.error(`Failed to dump ${t}:`, err.message || err);
      }
    }
    console.log('Snapshot complete. Files:\n' + results.join('\n'));
  } catch (err) {
    console.error('Snapshot failed:', err.message || err);
    process.exit(2);
  }
}

main();
