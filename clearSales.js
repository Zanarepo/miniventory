import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file directly (since dotenv might not be installed)
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

if (!url || !key) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log("Deleting sales...");
  const { error: err1 } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error("Error deleting sales:", err1);
  
  console.log("Deleting inventory transactions...");
  const { error: err2 } = await supabase.from('inventory_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.error("Error deleting txs:", err2);
  
  console.log("Resetting item units to AVAILABLE...");
  const { error: err3 } = await supabase.from('item_units').update({ status: 'AVAILABLE' }).in('status', ['SOLD', 'VOID', 'PENDING_RESTOCK']);
  if (err3) console.error("Error updating item units:", err3);
  
  console.log("Done.");
}

run();
