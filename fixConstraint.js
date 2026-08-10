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

// Assuming SUPABASE_DB_PASSWORD is in .env or we can parse it from the URL
const urlMatch = envVars['VITE_SUPABASE_URL']?.match(/https:\/\/(.*?)\.supabase\.co/);
if (urlMatch && envVars['SUPABASE_DB_PASSWORD']) {
  const projectId = urlMatch[1];
  const password = envVars['SUPABASE_DB_PASSWORD'];
  const connString = `postgresql://postgres.${projectId}:${password}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`;
  
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false } // Required for Supabase connections
  });

  async function run() {
    try {
      await client.connect();
      console.log("Connected to Supabase Postgres!");
      
      await client.query(`
        ALTER TABLE item_units DROP CONSTRAINT IF EXISTS item_units_status_check;
        ALTER TABLE item_units ADD CONSTRAINT item_units_status_check 
        CHECK (status IN ('AVAILABLE', 'SOLD', 'VOID', 'DEFECTIVE', 'LOST', 'RESERVED', 'PENDING_RESTOCK'));
      `);
      console.log("Successfully updated item_units constraint!");
      
      await client.end();
    } catch (e) {
      console.error("Error:", e);
      client.end();
    }
  }
  run();
} else {
  console.log("Could not find VITE_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env");
}
