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
  console.log("Deleting all items from Supabase...");
  const { error } = await supabase.from('item_units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error("Failed to delete items:", error);
  } else {
    console.log("All items successfully deleted from Supabase!");
  }
}

run();
