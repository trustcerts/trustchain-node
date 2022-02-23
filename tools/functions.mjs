import { readFileSync } from 'fs';
import { spawn } from 'child_process';

const config = JSON.parse(readFileSync('./nest-cli.json', 'utf8'));
const apps = Object.keys(config.projects);
const projects = apps.filter(
  (app) => config.projects[app].type === 'application',
);

async function run(cmd) {
  const ls = spawn(cmd, { shell: true });
  return new Promise((resolve) => {
    // noinspection JSUnresolvedFunction
    ls.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    // noinspection JSUnresolvedFunction
    ls.stderr.on('data', (data) => {
      console.warn(data.toString());
    });

    ls.on('error', (error) => {
      console.error(error.message);
    });

    ls.on('close', () => {
      resolve();
    });
  });
}
export { projects, run };
