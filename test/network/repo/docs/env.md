# .env

this file includes all variables that are required to run the node. Keep in mind that it includes some secrets so be
careful where you backup it! In the future trustchain nodes will be able to run in kubernetes or docker swarm so secrets
can be securely mounted into the containers.

Some variables inform about including a yaml file. These files have to be included in the docker-compose call that is defined in the bash script.

### COMPOSE_PROJECT_NAME

give your containers a better prefix instead of the folder where you are right now

### NODE_TYPE

there are three different node types in the system:

**validator**: is able to be part in the consensus algorithm to generate blocks. Can generate or revoke certificates for gateways or observers.
Running a validator means you have to expose your network service to the public so other nodes can establish a connection with you.

**gateway**: is able to generate or revoke certificates for clients and will send new transactions from clients to the validators.

**observer**: will return hash signatures and certificates. Not able to write to the chain.

### RESTART

Docker [restart police](https://docs.docker.com/config/containers/start-containers-automatically/#use-a-restart-policy)

### IDENTIFIER

The unique identifier of a node in the network. Nodes with the same identifier will not be able to establish a connection.
It's included in the signed certificate for your keypair so pick a name everyone can understand.

### IMAGE_TAG

Image tag that should be used for all containers. master is the current one to use.

### DOMAIN

Qualified domain name of the node. Services will be attached with a port or a subdomain to be accessible.
You can use an IP adress and expose the services by port, but then the traffic will not be secured with TLS.

### NODE_SECRET

Secret to protect admin endpoints of the node. It will be loaded when the node starts, so it can be changed in the future.
This code is required when you want to communicate with endpoints that are exlusive for administration.

### NETWORK_SECRET

Secret to protect endpoints that are only available to nodes of the network. All participants have to use the same secret.

### LOG_LEVEL

Defines the log level in the docker log, default value is info. debug should be used with caution since it produces a lot of data.

### HTTP_PORT

External port where the http service is exposed.

Include `http/docker-compose.port.yml`

### HTTP_HOSTNAME

External hostname where the http service is exposed.

Include `http/docker-compose.port.yml`

### DATABASE_PORT

External port where the database service is exposed.

Include `database/docker-compose.port.yml`

### DB_USERNAME

Name of the root user who manages the server.

### DB_PASSWORD

Password of the username defined above.

### PROMETHEUS_PORT

External port where the prometheus service is exposed.

Include `prometheus/docker-compose.port.yml`

### PROMETHEUS_HOSTNAME

External hostname where the prometheus service is exposed.

Include `prometheus/docker-compose.proxy.yml`

### LOKI_PORT

External port where the loki service is exposed.

Include `loki/docker-compose.port.yml`

### LOKI_HOSTNAME

External hostname where the loki service is exposed.

Include `loki/docker-compose.proxy.yml`

### GRAFANA_PORT

External port where the grafana service is exposed.

Include `grafana/docker-compose.port.yml`

### GRAFANA_HOSTNAME

External hostname where the grafana service is exposed.

Include `grafana/docker-compose.proxy.yml`

## Gateway specific

Include `gateway/docker-compose.yml`

## Observer specific

Only required if you run a observer.

Include `observer/docker-compose.yml`

## Validator specific

Only required if you run a validator.

Include `validator/docker-compose.yml`

### VALIDATOR_MIN

Amount of validators that are required to run the consensus. Minimum is 2 so there is one proposer and one validator.

### NETWORK_PORT

External port where the network service is exposed.

Include `network/docker-compose.port.yml`

### NETWORK_HOSTNAME

External hostname where the network service is exposed.

Include `network/docker-compose.port.yml`

## Development specific

Only required if you work with the source code of the nodes.

Include `docker-compose.dev.yml`

### COMPILED_PATH

Path to the compiled source code, so the nodes can restart themselves if they detect new code changes.

### RESET

If set to true the node can be reset. Never use it in production!
