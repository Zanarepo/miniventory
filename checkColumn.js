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
  const { data, error } = await supabase.from('sale_items').select('serials').limit(1);
  if (error) {
    console.error("Column missing:", error);
  } else {
    console.log("Column exists!", data);
  }
}
run();
