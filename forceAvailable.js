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
  console.log("Forcing all items to AVAILABLE...");
  const { data, error } = await supabase
    .from('item_units')
    .update({ status: 'AVAILABLE' })
    .neq('status', 'AVAILABLE') // Update anything not available
    .select(); // return the updated rows to verify

  console.log("Updated rows count:", data ? data.length : 0);
  if (error) {
    console.error("Error:", error);
  }
  
  if (data && data.length > 0) {
    console.log("First updated row:", data[0]);
  }
}

run();
