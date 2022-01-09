import { projects, run } from './functions.mjs';

(async () => {
    // await run(
    //     `docker load -i ./docker-dist/trustchain-baseimage.tar`
    // )

    await run(
        `docker load -i ./docker-dist/trustchain-dev.tar`
    )
    for (let project of projects) {
    await run(
        ` docker load -i ./docker-dist/trustchain-${project}.tar`
    )
    }
})();
