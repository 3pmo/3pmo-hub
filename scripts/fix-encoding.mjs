import fs from 'fs';
const file = 'C:/Users/willl/My Drive/AI/_System/project-registry.md';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/â€”/g, '—')
           .replace(/ðŸ ›/g, '🐛')
           .replace(/ðŸš€/g, '🚀')
           .replace(/Â·/g, '·');
fs.writeFileSync(file, text, 'utf8');
console.log('Fixed project-registry.md encoding');
