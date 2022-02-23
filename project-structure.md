# Default folders
these folder names are reserved for special purpose:
- dto: includes all classes that are required for data transfer like APIs. The classes include validation rules for incoming data and a correct swagger information to generate a swagger documentation automatically.
- schemas: includes the schemas for the parsing databases.

# Apps
Includes the code of the microservices. Components that are shared between at least two microservices, like the same interface or parent class, are located in the `apps/shared` folder.

# Libs
Shared code that will be used in the microservices in the `apps` folder.

## Clients
includes the client to interact with another microservice. The http service is only able to startup when the network service is already started. In this case the network-client can be used to guarantee the boot order.

TODO: describe here what have all clients in common and what has to be done if a new client should be added.

## Transactions

The trustchain is able to handle multiple type of transactions. Each transaction has special rules for validation and parsing or other unique requirements. The required services will be implemented in a new library that can be included in the microservices like parsing or http-gateway.

TODO: describe the structure and where each component is used (validation, parsing, db, etc).