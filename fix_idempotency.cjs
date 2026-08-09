const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/20260808193000_add_rbac.sql', 'utf8');

const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Match CREATE POLICY "name" ON public.table
  const match = line.match(/^CREATE POLICY "([^"]+)" ON (public\.[a-zA-Z_]+)/);
  if (match) {
    const policyName = match[1];
    const tableName = match[2];
    
    // Check if the previous line or nearby lines already have the drop for this policy
    const dropStatement = `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`;
    
    let hasDrop = false;
    for (let j = Math.max(0, newLines.length - 3); j < newLines.length; j++) {
      if (newLines[j].includes(dropStatement)) {
        hasDrop = true;
        break;
      }
    }
    
    if (!hasDrop) {
      newLines.push(dropStatement);
    }
  }
  
  newLines.push(line);
}

fs.writeFileSync('supabase/migrations/20260808193000_add_rbac.sql', newLines.join('\n'));
console.log('Idempotency updated.');
