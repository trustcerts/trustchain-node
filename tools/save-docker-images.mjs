import { projects, run } from './functions.mjs';
import fs, { mkdir, mkdirSync } from 'fs';

const CONTAINER = process.env.CI_REGISTRY_IMAGE;
const CI_TAG = process.env.CI_COMMIT_BRANCH;

(async () => {
    if(!fs.existsSync(`./docker-dist`)){
        mkdirSync('docker-dist')
    }

    await run(
        `docker save trustcerts/trustchain-baseimage:${CI_TAG} > ./docker-dist/trustchain-baseimage.tar`
    )

    await run(
        `docker save trustcerts/trustchain-dev:${CI_TAG} > ./docker-dist/trustchain-dev.tar`
    )

    for (let project of projects) {
    await run(
        `docker save ${CONTAINER}-${project}:${CI_TAG} > ./docker-dist/trustchain-${project}.tar`
    )
    }
})();
