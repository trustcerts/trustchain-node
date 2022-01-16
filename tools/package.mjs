import { projects, run } from './functions.mjs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;

// build the images in parallel to speed up script.
(async () => {
  // build base image
  await Promise.all([
    run(
      `docker build -f ./build/baseimage.Dockerfile -t trustcerts/trustchain-baseimage:${CI_TAG} .`,
    ),
    // build dev image
    run(
      `docker build -f ./build/base-dev.Dockerfile -t trustcerts/trustchain-dev:${CI_TAG} .`,
    ).then(() =>
      // build them in parallel to speed up
      Promise.all(
        projects.map((project) =>
          run(
            `docker build --build-arg app=${project} --build-arg base=${CI_TAG} -f ./build/Dockerfile -t ${CONTAINER}-${project}:${CI_TAG} .`,
          ),
        ),
      ),
    ),
  ]);
})();
