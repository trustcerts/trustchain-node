NODE_PATH='../trustchain-config/nodes'
docker-compose \
    -f "$NODE_PATH/docker-compose.yml" \
    -f "$NODE_PATH/http/docker-compose.port.yml" \
    -f "$NODE_PATH/loki/docker-compose.yml" \
    -f "$NODE_PATH/database/docker-compose.yml" \
    -f "$NODE_PATH/database/docker-compose.port.yml" \
    -f "$NODE_PATH/validator/docker-compose.yml" \
    -f "$NODE_PATH/validator/docker-compose.port.yml" \
    -f "$NODE_PATH/docker-compose.docker.yml" \
    --env-file './validator3.env' \
    $@