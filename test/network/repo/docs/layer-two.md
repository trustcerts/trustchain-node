# Layer two

In this step the second layer for a trustchain network is set up. It allows the communication with the blockchain from
the outside world.

## Requirements
Check out the [requirements chapter](requirements.md) before you start configuring an gateway or observer.

## Node configuration

A full documentation of the variables in the `.env` file can be found [here](env.md).

After setting up the .env the shell script has to be configured. The normal input looks like this:

**Gateway**
```shell script
#!/bin/bash
NODE_PATH=../nodes
ENV=gateway

docker-compose \
  -f $NODE_PATH/docker-compose.yml \
  -f $NODE_PATH/http/docker-compose.proxy.yml \
  -f $NODE_PATH/gateway/docker-compose.yml \
  --env-file .$ENV.env \
  $@
```

**Observer**
```shell script
#!/bin/bash
NODE_PATH=../nodes
ENV=observer

docker-compose \
  -f $NODE_PATH/docker-compose.yml \
  -f $NODE_PATH/http/docker-compose.proxy.yml \
  -f $NODE_PATH/observer/docker-compose.yml \
  --env-file .$ENV.env \
  $@
```
`NODE_PATH` is pointing to the folder of the yml files from the repository. You don't have to change it when the shell
script is stored in the recommended `config` folder. The `ENV` is the name of the `.env` file that should follow the 
`.$ENV.env` syntax.

The minimum setup for a validator requires 4 yml files:
- `docker-compose.yml`: defining the base structure of a node
- `http/docker-compose.proxy.yml`: exposing the api of the node by hostname
- `gateway/docker-compose.yml`: configuration of the services to run as an gateway/ a observer

In the [.env documentation](env.md) each variable explains which yml file has to be appended. The order of the yml files are
important because old values will be overwritten.

You can make the shell script executable or call it with `bash` in the next steps.

## Start node
Before you start the node make sure you are using the latest images:
```shell script
bash node.sh pull
```

Start the node in the detached mode:
```shell script
bash node.sh up -d
```

On the first run docker-compose will also create the required networks and the docker volumes for persisted data.

### Validate startup
<!-- TODO: define a better way to check if node is ready -->

To validate that all services are running you can check the logs of the running containers. Depending on the system's
resources the startup can take some seconds.

```shell script
bash node.sh logs -f network
```
The last line should look similar to this one:
```
network_1     | 2020-11-04 09:38:19.452 -> (P2PService) key isn't signed yet
```

It informs about a missing signed key that will be available in the future to connect to the network.

All other services (`http`, `parse`, `persist`, `wallet`) should generate a log ending like this:
```
http_1        | 2020-11-04 09:38:20.960 -> (undefined) Nest application successfully started
```

## Receive an invitation
A member of the second layer needs an [invitation](invite.md) from the first layer. This token can be passed to the http
service:
```shell script
curl -X POST "https://api.gateway1.example.com/init" \
-H "accept: */*" -H "Authorization: Bearer ${NODE_SECRET}" -H "Content-Type: application/json" \
-d "{\"secret\":\"${INVITE}\",\"url\":\"${HTTP_VALIDATOR_URL}\"}"
```
- endpoint is protected by the node secret
- the generated invite code has to be send in the body (the identifier was configured in the .env file)
- the endpoint where the invitation token was generated

The node will receive his certificate that includes its signed key and connect to the network knowing it is a valid member
with a singed key. After syncing up with the network the node is ready to interact with [layer three](layer-three.md).
