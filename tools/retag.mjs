import { projects, run } from './functions.mjs';

const OLD_CONTAINER = process.env.CI_REGISTRY_IMAGE;
const NEW_CONTAINER = OLD_CONTAINER.split('/').slice(1).join('/');
const CI_TAG = process.env.CI_COMMIT_BRANCH;
const TAG_RELEASE = process.env.TAG_RELEASE;
(async () => {
  // build base image
  for (let project of projects) {
    await run(`docker pull ${OLD_CONTAINER}-${project}:${CI_TAG}`);
    await run(
      `docker tag ${OLD_CONTAINER}-${project}:${CI_TAG} ${NEW_CONTAINER}-${project}:${TAG_RELEASE}`,
    );
    await run(`docker push ${NEW_CONTAINER}-${project}:${TAG_RELEASE}`);
    // TODO remove old image from the github registry.
  }
})();
