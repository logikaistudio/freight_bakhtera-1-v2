import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Old project
const OLD_URL = 'https://nkyoszmtyrpdwfjxggmb.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reW9zem10eXJwZHdmanhnZ21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTAzMTYsImV4cCI6MjA4MjI4NjMxNn0.qeCz78VNVEcnjUXgBywdxF9Ju1eZzlRPJa_Ff-_33XQ';
const oldSupabase = createClient(OLD_URL, OLD_KEY);

// Backup: the images we downloaded earlier
const FILE_MAP = {
  'doc-1777264056788': { name: 'PKG-001, BOX-A3', fileName: 'PKG-001, BOX-A3.jpeg', fileType: 'jpeg', localPath: 'scripts/verify_downloads_output/doc-1777264056788' },
  'doc-1777264144748': { name: 'PKG-001, BOX-A1', fileName: 'PKG-001, BOX-A1.jpeg', fileType: 'jpeg', localPath: 'scripts/verify_downloads_output/doc-1777264144748' },
  'doc-1777264154215': { name: 'PKG-001, BOX-A2', fileName: 'PKG-001,BOX-A2.jpeg', fileType: 'jpeg', localPath: 'scripts/verify_downloads_output/doc-1777264154215' },
};

async function run() {
  // Build updated docs with base64 fileData
  const updatedDocs = [];
  
  for (const [docId, info] of Object.entries(FILE_MAP)) {
    if (!fs.existsSync(info.localPath)) {
      console.warn('⚠️  File not found:', info.localPath);
      continue;
    }
    const buffer = fs.readFileSync(info.localPath);
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    
    updatedDocs.push({
      id: docId,
      name: info.name,
      fileName: info.fileName,
      fileType: info.fileType,
      fileSize: buffer.length,
      fileData: dataUri,
      uploadedAt: new Date().toISOString(),
    });
    console.log(`✅ Converted ${info.name} to base64 (${Math.round(buffer.length/1024)}KB)`);
  }

  if (updatedDocs.length === 0) {
    console.error('No docs to update');
    return;
  }

  // Update the OLD project record 
  console.log('\n🔵 Updating old project record QT-1777264191569...');
  const { error: oldError } = await oldSupabase
    .from('freight_quotations')
    .update({ documents: updatedDocs })
    .eq('id', 'QT-1777264191569');
  
  if (oldError) {
    console.error('❌ Old project update failed:', oldError.message);
  } else {
    console.log('✅ Old project record updated with base64 fileData!');
  }
}

run().catch(console.error);
