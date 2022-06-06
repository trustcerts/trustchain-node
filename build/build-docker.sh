cd ..
docker build -t trustcerts/trustchain-dev -f ./build/base-dev.Dockerfile --build-arg NPM_TOKEN=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 .
docker push trustcerts/trustchain-dev
