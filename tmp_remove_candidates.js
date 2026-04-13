const fs = require('fs');
const file = 'c:/Users/gtoal/OneDrive/Escritorio/arg-academy-fe/frontend/src/features/latam/teacher/components/LatamTeacherDashboard.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('{tab === \'candidates\' && ('));
// We know it goes up to just before "Courses Tab" which is around line 286.
const endIndex = lines.findIndex(l => l.includes('{/* Courses Tab */}'));

if (startIndex !== -1 && endIndex !== -1) {
  let toInject = [
      '          {/* Candidates Tab */} ',
      '          {tab === \'candidates\' && (',
      '            <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">',
      '              <CandidatesList candidates={candidates} expandedCandidate={expandedCandidate} setExpandedCandidate={setExpandedCandidate} />',
      '            </motion.div>',
      '          )}'
  ];
  lines.splice(startIndex - 1, endIndex - startIndex, ...toInject);
  
  // Add import statement at the top
  const importIndex = lines.findIndex(l => l.includes('import { LAB_TOOLS, ActivityCreatorModal }'));
  lines.splice(importIndex + 1, 0, 'import { CandidatesList } from \'./CandidatesList\';');
  
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully replaced candidates tab');
} else {
  console.log('Could not find start or end index', { startIndex, endIndex });
}
