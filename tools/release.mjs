import { projects, run } from './functions.mjs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;

(async () => {
  for (let project of projects) {
    await run(`docker push ${CONTAINER}/${project}:${CI_TAG}`);
  }
})();
