
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const replacements = [
  { file: 'src/styles/index.css', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/pages/SalesHistory.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/pages/Profile.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/pages/Landing.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/pages/Financials.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/pages/Expenses.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/pages/DesignSystem.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/layouts/AppLayout.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/components/landing/LandingProfitMockup.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' },
  { file: 'src/components/landing/LandingFeatureShowcase.tsx', search: /--brand-cyan/g, replace: '--brand-secondary' }
];

replacements.forEach(({ file, search, replace }) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('File not found: ' + file);
  }
});

