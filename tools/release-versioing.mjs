import { projects, run } from './functions.mjs';

(async () => {
  for (let project of projects) {
    const path = `${process.env.CI_REGISTRY_IMAGE}/${project}`;
    for (let tag in [
      `v${process.env.tag}`,
      `latest`,
      `v${process.env.major_minor}`,
      `v${process.env.major}`,
    ]) {
      await run(
        `docker tag "${path}:${process.env.DOCKER_BUILD}" "${path}:${tag}"`,
      );
      await run(`docker push "${path}:${tag}`);
    }
  }
})();
