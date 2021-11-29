import { WritableStreamBuffer } from 'stream-buffers';
import { projects, run } from './functions.mjs';
import semanticRelease from 'semantic-release';
const stdoutBuffer = new WritableStreamBuffer();
const stderrBuffer = new WritableStreamBuffer();
try {
  const result = await semanticRelease(
    {
      // Core options
      branches: ['main', 'legal'],
      repositoryUrl: 'https://github.com/trustcerts/trustchain-node.git',
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/github',
      ],
      tagFormat: '${version}',
    },
    {
      stdout: stdoutBuffer,
      stderr: stderrBuffer,
    },
  );
  if (result) {
    const { lastRelease, commits, nextRelease, releases } = result;
    console.log(
      `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`,
    );
    if (nextRelease.version) {
      //TODO build versioned docker container: when there is a new patch 1.1.10, update 1, 1.1, 1.1.10, latest
      const elements = nextRelease.version.split('.');
      const major = elements[0];
      const minor = elements[1];
      const patch = elements[2];
      console.log(elements);
      for (let project of projects) {
        const path = `${process.env.CI_REGISTRY_IMAGE}/${project}`;
        for (let tag in [
          'latest',
          major,
          [major, minor].join('.'),
          [major, minor, patch].join('.'),
        ]) {
          await run(
            `docker tag "${path}:${process.env.DOCKER_BUILD}" "${path}:${tag}"`,
          );
          await run(`docker push "${path}:${tag}`);
        }
      }
      console.log(`The last release was "${lastRelease.version}".`);
    }
    for (const release of releases) {
      console.log(
        `The release was published with plugin "${release.pluginName}".`,
      );
    }
  } else {
    console.log('No release published.');
  }
  // Get stdout and stderr content
  const logs = stdoutBuffer.getContentsAsString('utf8');
  const errors = stderrBuffer.getContentsAsString('utf8');
} catch (err) {
  console.error('The automated release failed with %O', err);
}
