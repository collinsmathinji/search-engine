const fs = require('fs');
const path = require('path');

const langContent = fs.readFileSync(path.join(__dirname, '../lib/languages.ts'), 'utf8');
const countryContent = fs.readFileSync(path.join(__dirname, '../lib/countries.ts'), 'utf8');

const langMatch = langContent.match(/export const LANGUAGES = \[([\s\S]*?)\]\s*as const/);
const countryMatch = countryContent.match(/export const COUNTRIES = \[([\s\S]*?)\]\s*as const/);

if (!langMatch || !countryMatch) throw new Error('Could not parse');

function parseArray(str) {
  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(str)) !== null) out.push(m[1].replace(/\\'/g, "'"));
  return out;
}

const langs = parseArray(langMatch[1]);
const countries = parseArray(countryMatch[1]);

const outDir = path.join(__dirname, '../public/data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'languages.json'), JSON.stringify(langs));
fs.writeFileSync(path.join(outDir, 'countries.json'), JSON.stringify(countries));

console.log('Wrote', langs.length, 'languages and', countries.length, 'countries');
