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
  const { data, error } = await supabase.rpc('get_item_units_constraints' || 'run_sql', { sql: `
    SELECT pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'item_units'::regclass;
  `});
  if (error) {
    console.log("Fallback to insert test...");
    const { error: insertError } = await supabase.from('item_units').insert([{
        id: '123e4567-e89b-12d3-a456-426614174001',
        business_id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: '123e4567-e89b-12d3-a456-426614174002',
        serial_barcode: 'TEST_VOID',
        status: 'VOID',
        created_at: new Date().toISOString()
    }]);
    console.log("Insert VOID error:", insertError);
    if(insertError) {
      console.log("CONSTRAINT IS LIKELY NOT APPLIED!");
    } else {
       console.log("CONSTRAINT APPLIED. DELETING TEST RECORD...");
       await supabase.from('item_units').delete().eq('serial_barcode', 'TEST_VOID');
    }
  } else {
    console.log(data);
  }
}

run();
