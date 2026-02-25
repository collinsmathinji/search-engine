const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dirs = [path.join(root, '.next'), path.join(root, 'node_modules', '.cache')];
for (const dir of dirs) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('Removed:', dir);
  } catch (e) {
    if (e.code !== 'ENOENT') console.error(e);
  }
}
console.log('Clean done. Run: npm run build && npm run dev');
