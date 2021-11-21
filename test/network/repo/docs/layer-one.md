# Layer one

In this step the base layer for a trustchain network is set up.

## Requirements
Check out the [requirements chapter](requirements.md) before you start configuring a validator.

## Node configuration

A full documentation of the variables in the `.env` file can be found [here](env.md).

After setting up the .env the shell script has to be configured. The normal input looks like this:
```shell script
#!/bin/bash
NODE_PATH=../nodes
ENV=validator

docker-compose \
  -f $NODE_PATH/docker-compose.yml \
  -f $NODE_PATH/http/docker-compose.proxy.yml \
  -f $NODE_PATH/validator/docker-compose.yml \
  -f $NODE_PATH/validator/docker-compose.proxy.yml \
  --env-file .$ENV.env \
  $@
```
`NODE_PATH` is pointing to the folder of the yml files from the repository. You don't have to change it when the shell
script is stored in the recommended `config` folder. The `ENV` is the name of the `.env` file that should follow the 
`.$ENV.env` syntax.

The minimum setup for a validator requires 4 yml files:
- `docker-compose.yml`: defining the base structure of a node
- `http/docker-compose.proxy.yml`: exposing the api of the node by hostname
- `validator/docker-compose.yml`: configuration of the services to run as a validator
- `validator/docker-compose.proxy.yml`: exposing the validator node service by hostname

In the [.env documentation](env.md) each variable explains which yml file has to be appended. The order of the yml files are
important because old values will be overwritten.

You can make the shell script executable or call it with `bash` in the next steps.

## Start node
Before you start the node make sure you are using the latest images:
```shell script
bash validator.sh pull
```

Start the node in the detached mode:
```shell script
bash validator.sh up -d
```

On the first run docker-compose will also create the required networks and the docker volumes for persisted data.

### Validate startup
<!-- TODO: define a better way to check if node is ready -->

To validate that all services are running you can check the logs of the running containers. Depending on the system's
resources the startup can take some seconds.

```shell script
bash validator.sh logs -f network
```
The last line should look similar to this one:
```
network_1     | 2020-11-04 09:38:19.446 -> (Connection) node.validator1.example.com seems to be available
network_1     | 2020-11-04 09:38:19.452 -> (P2PService) key isn't signed yet
```

The first line shows that the node can access itself by its hostname. This can take some seconds since the proxy has to
generate a tls certificate and update the router settings. The second line is the result of a missing root certificate
that will be generated in the next steps.

All other services (`http`, `parse`, `persist`, `wallet`) should generate a log ending like this:
```
http_1        | 2020-11-04 09:38:20.960 -> (undefined) Nest application successfully started
```

## Generate root certificate
When all validators are online, one of them has to start the generation process of a [root certificate](pki/root-cert.md). 
A curl request to the http endpoint will inform the node which validators should be included:
- The request has to be fired against the http endpoint, not the node service
- The node secret has to be passed as an authorization token
- All node endpoints have to be passed as a JSON string-array

```shell script
curl -X POST "https://api.validator1.example.com/root-cert/create" \
-H "accept: */*" -H "Authorization: Bearer ${NODE_SECRET}" -H "Content-Type: application/json" \
-d "[\"node.validator1.example.com\", \"node.validator2.example.com\", \"node.validator3.example.com\", \"node.validator4.example.com\"]"
```

The http endpoint will coordinate the public key exchanges to generate a root certificate. After this the nodes will connect to
each other to build up a mashed p2p network. The genesis block will be built including a transaction that defines the
root certificate. The response from the curl request is the transaction's hash.

After this step the definition of layer one is completed and the network is ready to build [layer two](layer-two.md).

## Updating layer one
There are several reasons to update the first layer:
- a new validator should join the network
- an existing validator should be removed
- the public key of a validator changes

This can be done by sending the curl request to generate a new root certificate that will replace the current one.
