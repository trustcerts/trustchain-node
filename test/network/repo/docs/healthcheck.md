# Health check
The consensus algorithm is designed to only build blocks when new transactions exists. To avoid the risk of manipulation
and to make sure that the network is up and running a health check can be activated. This service will sign a random hash,
this procedure can be run as a cronjob to automatise this job.

You need a valid invitation token for a client to register the health check service. A json file contains the service
configuration and need the following structure:
```json
{
    "identifier": "IDENTIFIER",
    "inviteSecret": "SECRET",
    "gateways": ["OBSERVER"]
}
```

Enter the secret and the identifier. The gateway's http endpoint has to be parsed as an array so the service can store
a backup endpoint if the first known gateway is not reachable.

The service is run with docker and needs access to the generated json file. After receiving a signature the key pair will
be stored in the json file.

```shell script
docker run --rm -v /path/to/config.json:/usr/src/app/config.json --name trustchain-health-check registry.gitlab.com/trustcerts/trustchain-health-check 
```

To call the health check periodically you can register the call as a cronjob. The interval is based on your alert rules
you have defined in grafana. 
