## Requirements

### OS

The software is running inside docker containers so each system that is able to run docker should be fine.

### Docker and Docker-Compose

A node is a construct of microservices that are packed up in containers so docker has to be installed:

```shell script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
```

To manage the services docker-compose is used, so install as well:

```shell script
curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Accessing images

To get the images the system need access to the registry:

```shell script
docker login registry.gitlab.com -u ${USER} -p ${PASSWORD}
```

The credentials have to be set before or replaced in the command.

### Reverse Proxy

There are two different possibilities to expose the services: by hostname or by port. If you want to expose by port you
can skip this step. We don't recommend using the port method in production mode since the traffic will be unencrypted. Make sure to open Port 80 and 443 so the reverse proxy can redirect incoming traffic on port 80. Check if [CAA](https://letsencrypt.org/docs/caa/) could cause some problems. If you run multiple nodes on one machine only one reverse
proxy is required.

<!-- TODO: insert image how the proxy works -->

The reverse proxy will handle any incoming requests and route them to the correct docker container. Let's encrypt will
also make sure that the traffic over HTTP ans WS is encrypted. To set up the proxy git has to be installed. Then you can clone the repo and start the proxy:

```shell script
git clone https://github.com/evertramos/docker-compose-letsencrypt-nginx-proxy-companion.git proxy
cd proxy && cp .env.sample .env && ./start.sh && cd ..
```

By using the hostname method you have to configure your DNS. You can either route by a wildcard or add every hostname
manually. No service is listening on the fully qualified domain name so only `*.example.com` is required. If you can not
use wildcard, you have to define these routes:

- api service: to interact with the node (default _api._)
- node service: only required if you run a validator (default _node._)
- prometheus service: only required when you want to expose your Prometheus to the public (default _prometheus._)
- loki service: only required when you want to expose your loki to the public (default _loki._)
- grafana service: only required if you want to monitor your node directly on the mashine with public access (default: _grafana_)

Nodes in the system do not have to choose the same names for the services. Each node will tell the other node how it can be reached.

### Configuration template

This repository also includes the required docker-compose ymls to start up a node. Cloning this repository on the machine
is the easiest way to pull the latest configuration updates:

```shell script
git clone https://gitlab.com/trustcerts-mimo/trustchain-scripts.git
```

Go into the cloned repository folder.

## Configuration

Each node requires a `.env` file and a bash script. The `.env` file includes environment variables that will be passed to
the different docker containers on start. The bash script defines which yml files should be included. This approach allows
the usage of a modular configuration with small files.

In the `config-example` folder from the cloned git repository there is the pair of files depending on which type of node you want to run. We suggest
creating a `config` folder on the same level as `config-example` where you can store your configuration files. The folder is
excluded from the git repository so there will be no conflicts with pulls in the future. You can copy the required files
in the folder and modification them.
