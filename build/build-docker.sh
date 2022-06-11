cd ..
docker build -t trustcerts/trustchain-dev -f ./build/base-dev.Dockerfile .
docker push trustcerts/trustchain-dev
