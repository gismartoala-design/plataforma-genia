const fs = require('fs');
const file = 'c:/Users/gtoal/OneDrive/Escritorio/arg-academy-fe/frontend/src/features/latam/teacher/components/LatamTeacherDashboard.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find start and end
const startIndex = lines.findIndex(l => l.includes('const LAB_TOOLS = ['));
const endIndex = lines.findIndex(l => l.includes('// ─── Laboratory Viewer'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex, 'import { LAB_TOOLS, ActivityCreatorModal } from \'./ActivityCreatorModal\';');
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully replaced lines ' + startIndex + ' to ' + (endIndex - 1));
} else {
  console.log('Could not find start or end index', { startIndex, endIndex });
}
