#!/bin/bash
NODE_PATH=../nodes
ENV=observer

docker-compose \
  -f $NODE_PATH/docker-compose.yml \
  -f $NODE_PATH/http/docker-compose.proxy.yml \
  -f $NODE_PATH/observer/docker-compose.yml \
  -f $NODE_PATH/database/docker-compose.yml \
  --env-file .$ENV.env \
  $@
