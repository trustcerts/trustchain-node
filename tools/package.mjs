import { projects, run } from './functions.mjs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;

(async () => {
  // // build base image
  // await run(
  //   `docker build -f ./build/baseimage.Dockerfile -t trustcerts/trustchain-baseimage:${CI_TAG} .`,
  // );
  // await run(`docker push trustcerts/trustchain-baseimage:${CI_TAG}`);

  // // build dev image
  // await run(
  //   `docker build -f ./build/base-dev.Dockerfile -t trustcerts/trustchain-dev:${CI_TAG} .`,
  // );
  // await run(`docker push trustcerts/trustchain-dev:${CI_TAG}`);
  for (let project of projects) {
    await run(
      `docker build --build-arg app=${project} --build-arg base=${CI_TAG} -f ./build/Dockerfile -t ${CONTAINER}-${project}:${CI_TAG} .`,
    );
  }
})();
