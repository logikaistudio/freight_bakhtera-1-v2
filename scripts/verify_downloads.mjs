#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(process.cwd(), 'scripts', 'verify_downloads_output');
const QUOTATION_ID = process.env.QUOTATION_ID || 'QT-1777264191569';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ensureDir = (d) => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };

const run = async () => {
  ensureDir(OUTPUT_DIR);
  try {
    const { data, error } = await supabase.from('freight_quotations').select('id, documents, bc_supporting_documents').eq('id', QUOTATION_ID).single();
    if (error) throw error;
    const docs = (data.documents || []).concat(data.bc_supporting_documents || []);
    if (docs.length === 0) {
      console.log('No docs found for', QUOTATION_ID);
      return;
    }
    for (const d of docs) {
      const bucket = d.bucket || 'bridge-documents';
      const key = d.storageKey || d.storage_key || d.fileName;
      console.log('Preparing download for', d.fileName || d.name || key);
      // Prefer signed URL
      const { data: signedData, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(d.storageKey, 60);
      if (signErr) {
        console.warn('Signed URL failed:', signErr.message || signErr);
      }
      const url = (signedData && (signedData.signedUrl || signedData.signedURL)) || d.url || d.fileData || null;
      if (!url) { console.warn('No URL for', d); continue; }
      const res = await fetch(url);
      if (!res.ok) { console.warn('Failed to fetch', url, res.status); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const outPath = path.join(OUTPUT_DIR, `${d.id || d.fileName || 'doc'}`.replace(/[^a-zA-Z0-9._-]/g, '_'));
      fs.writeFileSync(outPath, buf);
      console.log('Saved', outPath, 'size', buf.length);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
};

run();
