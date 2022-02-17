docker network inspect test-network >/dev/null 2>&1 || \
    docker network create test-network

for id in validator1 validator2 validator3 validator4 gateway1 gateway2 observer1 observer2 
do
    ./$id.sh $@
done