# TrustChain

this repository includes all information of how to set up a trustchain and how to interact with it.

## Network base concept

The network is based on a layer model, where each layer's members have different tasks. Each layer is only communicating
with its neighbours.

The first layer contains the root members of the network, the validators. They are responsible for the consensus mechanisms
and managing the second layer. On the second layer are two different type of members, some are responsible for write requests and others for
read requests. Gateways are managing the third layer and act like gatekeepers. They are validating and filtering any
input from the third layer and will send it to the members of the first layer if necessary. Observers are giving the third
layer access to read from the blockchain. On the third layer are clients, they use the second layer to interact with the
blockchain. They are not full nodes like the members from layer one and layer two to reduce the requirement resources.

## Getting started

To build up a trustchain network the different layers have to be build up from 1 to 3 since the lower layer is responsible for
the next one. 

- [Build Layer one](docs/layer-one.md)
- [Build Layer two](docs/layer-two.md)
- [Build Layer three](docs/layer-three.md)

## Further topics
- [monitoring](docs/monitoring.md)
- [configure health check](docs/healthcheck.md)
