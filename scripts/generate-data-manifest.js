const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dataDir = path.join(root, 'data');
const outputFile = path.join(dataDir, 'files.json');

const sections = ['skills', 'work', 'experience', 'goals', 'education', 'achievements', 'contact'];

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

function generate() {
  const manifest = sections.reduce((acc, section) => {
    acc[section] = getTxtFiles(section);
    return acc;
  }, {});

  fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Generated ${path.relative(root, outputFile)}`);
}

generate();

if (process.argv.includes('--watch')) {
  console.log('Watching data/ for changes...');
  let debounce = null;
  fs.watch(dataDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.txt') || filename.endsWith('template.txt')) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log(`Change detected: ${filename}`);
      generate();
    }, 100);
  });
}
