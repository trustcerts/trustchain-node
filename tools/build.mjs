import { projects, run } from './functions.mjs';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

// add build information
const buildFile = './apps/shared/build.ts';
const content = readFileSync(buildFile, 'utf8');
let newContent = content.replace(
  `buildDate = 0`,
  `buildDate = ${new Date().toISOString()}`,
);
newContent = newContent.replace(
  `build = ''`,
  `build = '${randomBytes(8).toString('hex')}'`,
);

const packageJsonFile = JSON.parse(readFileSync('package.json', 'utf8'));
newContent = newContent.replace(
  `version = ''`,
  `version = '${packageJsonFile.version}'`,
);

writeFileSync(buildFile, newContent);

(async () => {
  for (let project of projects) {
    await run(`npm run build ${project}`);
  }
  writeFileSync(buildFile, content);
})();
