const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dataDir = path.join(root, 'data');
const outputFile = path.join(dataDir, 'files.json');

const sections = ['work', 'education', 'achievements', 'contact', 'goals'];

function getTxtFiles(section) {
  const sectionPath = path.join(dataDir, section);
  if (!fs.existsSync(sectionPath)) {
    return [];
  }

  return fs
    .readdirSync(sectionPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.txt') && entry.name !== 'template.txt')
    .map((entry) => `data/${section}/${entry.name}`)
    .sort((a, b) => a.localeCompare(b));
}

const manifest = sections.reduce((acc, section) => {
  acc[section] = getTxtFiles(section);
  return acc;
}, {});

fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root, outputFile)}`);
