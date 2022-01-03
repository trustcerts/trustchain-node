import { projects, run } from './functions.mjs';

(async () => {
    for (let project of projects) {
    await run(
        ` docker load -i ./docker-dist/trustchain-${project}.tar`
    )
    }
})();
