cd ..
docker build -t registry.gitlab.com/trustcerts/trustchain:dev -f ./build/base-dev.Dockerfile --build-arg NPM_TOKEN=Hb5oGj7ZtPUbwxQYBTpL .
docker push registry.gitlab.com/trustcerts/trustchain:dev
