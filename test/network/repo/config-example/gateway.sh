#!/bin/bash
NODE_PATH=../nodes
ENV=gateway

docker-compose \
  -f $NODE_PATH/docker-compose.yml \
  -f $NODE_PATH/http/docker-compose.proxy.yml \
  -f $NODE_PATH/gateway/docker-compose.yml \
  -f $NODE_PATH/database/docker-compose.yml \
  --env-file .$ENV.env \
  $@
