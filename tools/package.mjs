import { projects, run } from './functions.mjs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;
const TOKEN = process.env.NPM_TOKEN;

(async () => {
  await run(
    `docker build --pull -f ./build/baseimage.Dockerfile -t baseimage --build-arg NPM_TOKEN=${TOKEN} .`,
  );
  for (let project of projects) {
    await run(
      `docker build --pull --build-arg app=${project} -f ./build/Dockerfile -t ${CONTAINER}/${project}:${CI_TAG} .`,
    );
  }
})();
