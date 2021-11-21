#!/bin/bash
echo "reset"

for HOST in localhost:3500 localhost:3510 localhost:3520 localhost:3530 localhost:3540 localhost:3550 localhost:3560 localhost:3570 ; do
  until $(curl --output /dev/null --silent --head --fail "http://$HOST"); do
    printf "$HOST is not there yet\n"
    sleep 5
  done
  curl -X POST "http://$HOST/reset" -H "accept: */*" -H "Authorization: Bearer dev" -d ""
done

echo "create the root cert"
curl -X POST "http://localhost:3500/did/genesis" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "[\"validator1_network_1:3000\",\"validator2_network_1:3000\",\"validator3_network_1:3000\",\"validator4_network_1:3000\"]"

echo "invite gateway"
curl -X POST "http://localhost:3500/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHY\",\"name\":\"Gateway1\",\"secret\":\"foobar\",\"role\":\"gateway\"}" &
curl -X POST "http://localhost:3500/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHZ\",\"name\":\"Gateway2\",\"secret\":\"foobar\",\"role\":\"gateway\"}" &
echo "invite observer" &
curl -X POST "http://localhost:3500/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHW\",\"name\":\"Observer1\",\"secret\":\"foobar\",\"role\":\"observer\"}" &
curl -X POST "http://localhost:3500/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHQ\",\"name\":\"Observer2\",\"secret\":\"foobar\",\"role\":\"observer\"}" &

echo "add gateway" &
curl -X POST "http://localhost:3540/init" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHY\",\"secret\":\"foobar\",\"url\":\"validator1_http_1:3000\"}" &
curl -X POST "http://localhost:3550/init" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHZ\",\"secret\":\"foobar\",\"url\":\"validator1_http_1:3000\"}" &
echo "add observer" &
curl -X POST "http://localhost:3560/init" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHW\",\"secret\":\"foobar\",\"url\":\"validator1_http_1:3000\"}" &
curl -X POST "http://localhost:3570/init" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69BeqEgq7oqqdEsHQ\",\"secret\":\"foobar\",\"url\":\"validator1_http_1:3000\"}"

echo "add client"
curl -X POST "http://localhost:3540/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69tqEgq7oqqdEsHW\",\"name\":\"client\",\"secret\":\"client\",\"role\":\"client\"}" &
curl -X POST "http://localhost:3540/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69jeqEgq7oqqdEsHW\",\"name\":\"Healthcheck\",\"secret\":\"Healthcheck\",\"role\":\"client\"}" &
curl -X POST "http://localhost:3540/did/invite" -H "accept: */*" -H "Authorization: Bearer dev" -H "Content-Type: application/json" -d "{\"id\":\"did:trust:tc:dev:id:XLzBJ69keqEgq7oqqdEsHW\",\"name\":\"platform\",\"secret\":\"foobar\",\"role\":\"client\"}"


exit