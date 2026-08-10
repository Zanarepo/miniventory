import { Client } from 'pg';
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

// Assuming standard Supabase DB URL format
// Example: postgres://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
const dbUrl = envVars.VITE_SUPABASE_URL.replace('https://', '').split('.')[0]; 
// Wait, we used SUPABASE_DB_PASSWORD in a previous script! 
// Actually, earlier we did a node script with the raw password in `pg`.
