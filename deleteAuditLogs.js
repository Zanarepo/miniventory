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
  console.log("Deleting all records from audit_logs...");
  const { error } = await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error("Failed to delete audit_logs:", error);
  } else {
    console.log("All records successfully deleted from audit_logs in Supabase!");
  }
}

run();
