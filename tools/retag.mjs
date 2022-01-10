import { projects, run } from './functions.mjs';

const CI_TAG = process.env.CI_TAG;
const TAG_RELEASE = process.env.TAG_RELEASE;
(async () => {
  for (let project of projects) {
    await run(
      `docker tag trustcerts/trustchain-${project}:${CI_TAG} trustcerts/trustchain-${project}:${TAG_RELEASE}`,
    );
    await run(`docker push trustcerts/trustchain-${project}:${TAG_RELEASE}`);
  }
})();
