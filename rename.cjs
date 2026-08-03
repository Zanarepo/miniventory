const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'vite.config.ts', search: /BizTrack Lite/g, replace: 'Miniventory' },
  { file: 'vite.config.ts', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/utils/authFormatter.ts', search: /biztrack/g, replace: 'miniventory' },
  { file: 'src/types/business.ts', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/services/ReportingService.ts', search: /BizTrack Lite/g, replace: 'Miniventory' },
  { file: 'src/services/ReportingService.ts', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/providers/ThemeProvider.tsx', search: /biztrack/g, replace: 'miniventory' },
  { file: 'src/providers/LanguageProvider.tsx', search: /biztrack/g, replace: 'miniventory' },
  { file: 'src/providers/CartProvider.tsx', search: /biztrack/g, replace: 'miniventory' },
  { file: 'src/providers/AuthProvider.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/providers/AppProviders.tsx', search: /biztrack/g, replace: 'miniventory' },
  { file: 'src/pages/Profile.tsx', search: /biztrack/g, replace: 'miniventory' },
  { file: 'src/pages/Landing.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/pages/DesignSystem.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/pages/admin/AdminUsers.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/pages/admin/AdminFinancials.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/pages/admin/AdminDashboard.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/pages/admin/AdminBusinesses.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/lib/dexie.ts', search: /BizTrackDB/g, replace: 'MiniventoryDB' },
  { file: 'src/lib/dexie.ts', search: /BizTrackDatabase/g, replace: 'MiniventoryDatabase' },
  { file: 'src/layouts/AppLayout.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/layouts/AppLayout.tsx', search: /Biz<span className="text-gradient">Track<\/span>/g, replace: 'Mini<span className="text-gradient">ventory<\/span>' },
  { file: 'src/i18n/translations.ts', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/components/InstallGuideModal.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/components/dashboard/BusinessComparisonChart.tsx', search: /BizTrack/g, replace: 'Miniventory' },
  { file: 'src/components/dashboard/BusinessComparisonChart.tsx', search: /BIZTRACK/g, replace: 'MINIVENTORY' },
  { file: 'package.json', search: /biztrack-lite/g, replace: 'miniventory' },
  { file: 'package-lock.json', search: /biztrack-lite/g, replace: 'miniventory' },
  { file: 'index.html', search: /temp_app/g, replace: 'Miniventory' }
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
