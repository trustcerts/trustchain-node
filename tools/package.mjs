import { projects, run } from './functions.mjs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;
const TOKEN = process.env.NPM_TOKEN;

(async () => {
  await run(
    `docker build -f ./build/baseimage.Dockerfile -t trustcerts/baseimage:${CI_TAG} --build-arg NPM_TOKEN=${TOKEN} .`,
  );
  await run(`docker push trustcerts/baseimage:${CI_TAG}`);
  for (let project of projects) {
    await run(
      `docker build --build-arg app=${project} -f ./build/Dockerfile -t ${CONTAINER}-${project}:${CI_TAG} .`,
    );
  }
})();
