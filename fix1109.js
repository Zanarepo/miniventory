import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
  }
});

const url = envVars['VITE_SUPABASE_URL'];
const key = envVars['SUPABASE_SECRET_KEY'];
const supabase = createClient(url, key);

async function run() {
  try {
    const orphanedSerials = ['1109'];
    console.log(`Force fixing serials: ${orphanedSerials.join(', ')}`);
    
    // Force update their status to VOID in item_units
    const { error: updateErr, data: updated } = await supabase
      .from('item_units')
      .update({ status: 'VOID' })
      .in('serial_barcode', orphanedSerials)
      .select();
      
    if (updateErr) throw updateErr;
    console.log(`Fixed ${updated?.length || 0} orphaned serials to VOID.`);
    
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
