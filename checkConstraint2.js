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
  const { error: insertError } = await supabase.from('item_units').insert([{
      id: '123e4567-e89b-12d3-a456-426614174001',
      business_id: '123e4567-e89b-12d3-a456-426614174000',
      product_id: '123e4567-e89b-12d3-a456-426614174002',
      serial_barcode: 'TEST_VOID',
      status: 'VOID',
      cost_price: 100,
      created_at: new Date().toISOString()
  }]);
  console.log("Insert VOID error:", insertError);
  if(insertError) {
    console.log("CONSTRAINT IS LIKELY REJECTING VOID!");
  } else {
     console.log("VOID ALLOWED. DELETING TEST RECORD...");
     await supabase.from('item_units').delete().eq('serial_barcode', 'TEST_VOID');
  }
}

run();
