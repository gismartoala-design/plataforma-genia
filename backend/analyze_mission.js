const fs = require('fs');
let raw = fs.readFileSync('c:/Users/OSCURIDAD/Desktop/plataforma-genia/mission_84_utf8.json', 'utf8');

// Strip BOM
if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
}

const content = JSON.parse(raw);
const mission = content.contenido;

console.log(`Mission: ${mission.mission.title}`);
console.log(`Grade: ${mission.mission.level}`);
console.log('---');

mission.moments.forEach((m, i) => {
    console.log(`Moment ${i+1}: ${m.title} (${m.time_minutes} min)`);
    m.blocks.forEach((b, j) => {
        let type = b.type;
        let summary = '';
        const getVal = (obj) => {
           if (typeof obj === 'string') return obj;
           if (obj && obj.text) return obj.text;
           return '';
        }
        
        if (b.type === 'teacher_intention') summary = getVal(b.content).substring(0, 50);
        if (b.type === 'student_context') summary = getVal(b.content).substring(0, 50);
        if (b.type === 'student_activity') summary = getVal(b.content).substring(0, 50);
        if (b.type === 'interaction_open') summary = 'Open Response';
        if (b.type === 'interaction_mc') {
            const q = b.content.question || 'No question text';
            summary = `Multiple Choice: ${q.substring(0, 30)}`;
        }
        
        console.log(`  - Block ${j+1}: ${type} | ${summary}`);
    });
});
