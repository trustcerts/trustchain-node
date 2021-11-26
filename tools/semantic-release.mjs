import { WritableStreamBuffer } from 'stream-buffers';
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
      dryRun: true,
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
    if (lastRelease.version) {
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
