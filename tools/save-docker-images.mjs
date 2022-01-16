import { existsSync, mkdirSync } from 'fs';
import { projects, run } from './functions.mjs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;

(async () => {
  if (!existsSync(`./docker-dist`)) {
    mkdirSync('docker-dist');
  }

  // Save all images in parallel
  Promise.all([
    run(
      `docker save trustcerts/trustchain-dev:${CI_TAG} > ./docker-dist/trustchain-dev.tar`,
    ),
    ...projects.map((project) =>
      run(
        `docker save ${CONTAINER}-${project}:${CI_TAG} > ./docker-dist/trustchain-${project}.tar`,
      ),
    ),
  ]);
})();
