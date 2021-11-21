# Ports
- HTTP-Server:    XXX0
- Parse:          XXX1
- Persist:        XXX2
- Network:        XXX3
- Wallet:         XXX4

# HTTP Server
- create transaction (store own certHash since this service creates transactions)
- validate incoming transactions
- rebuild or reset endpoint

# DB
- Cached values of the inputs

# Parser
- listener for new blocks to parse them (event-listener)
- share new parsed transaction (event-emit)
- rebuild (event-listener)
- reset (event-listener) 

# Persist
- write files to the disc (event-listener)
- share blocks to parse them again (endpoint, tcp)
- share blocks with the network (endpoint, tcp)
- reset (event-listener)

# Wallet
- sign input (endpoint, tcp)
- public key, required to get a certificate (endpoint, tcp)

# P2P
- Connect with the network
- reset (close all connections)


# General information
- All services have health endpoints to be analysed with prometheus
- Different types of transactions will be split in the microservices. Where should general information like type definitions be stored if the microservices will be separated on different repositories? Shares via npm packages? 

# Protocols
- www to blockchain: HTTP
- internal request-response: TCP (no big information inside to use gRPC)
- internal event-based: Redis
- blockchain network: WS (need to be bidirectional)
