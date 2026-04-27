import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BACKUP_JSON = 'scripts/migrate_backups/freight_quotations-QT-1777264191569-backup.json';
const DOWNLOADS_DIR = 'scripts/verify_downloads_output';
const BUCKET = 'bridge-documents';

const backup = JSON.parse(fs.readFileSync(BACKUP_JSON, 'utf8'));

async function run() {
  // Step 1: Create bucket if not exists
  console.log('🔵 Checking bucket...');
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets && buckets.some(b => b.name === BUCKET);
  
  if (!bucketExists) {
    console.log('📦 Creating bucket:', BUCKET);
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (bucketError) {
      console.error('❌ Failed to create bucket:', bucketError.message);
      console.log('👉 Please create the bucket manually in Supabase Dashboard as public bucket named: bridge-documents');
      process.exit(1);
    }
    console.log('✅ Bucket created');
  } else {
    console.log('✅ Bucket already exists');
  }

  // Step 2: Upload each file and collect new URLs
  const docMap = {
    'doc-1777264056788': backup.documents[0],
    'doc-1777264144748': backup.documents[1],
    'doc-1777264154215': backup.documents[2],
  };

  const updatedDocs = [];

  for (const [localId, doc] of Object.entries(docMap)) {
    const localFile = path.join(DOWNLOADS_DIR, localId);
    if (!fs.existsSync(localFile)) {
      console.warn('⚠️  Local file not found:', localFile);
      updatedDocs.push(doc);
      continue;
    }

    const fileBuffer = fs.readFileSync(localFile);
    const storageKey = doc.storageKey;
    console.log('⬆️  Uploading:', doc.fileName, '→', storageKey);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Upload failed for', doc.fileName, ':', uploadError.message);
      updatedDocs.push(doc);
      continue;
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storageKey);
    const newUrl = publicData.publicUrl;
    console.log('✅ Uploaded. New URL:', newUrl);

    updatedDocs.push({ ...doc, url: newUrl, bucket: BUCKET });
  }

  // Step 3: Update the freight_quotations record
  console.log('\n🔵 Updating freight_quotations record...');
  const { data: row, error: fetchError } = await supabase
    .from('freight_quotations')
    .select('id, documents')
    .eq('id', backup.id)
    .single();

  if (fetchError) {
    console.error('❌ Could not fetch record:', fetchError.message);
    console.log('Updated docs to apply manually:', JSON.stringify(updatedDocs, null, 2));
    return;
  }

  const { error: updateError } = await supabase
    .from('freight_quotations')
    .update({ documents: updatedDocs })
    .eq('id', backup.id);

  if (updateError) {
    console.error('❌ Update failed:', updateError.message);
  } else {
    console.log('✅ Record updated successfully!');
  }
}

run().catch(console.error);
