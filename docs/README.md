# Processes

## Invite

To sign a public key of a client or an gateway, the key must be passed with an invite code that is connected to the identifier. The Administrator of the node create a new inivte code for a given identifier that isn't used yet. The server will generate an entry with a unique password. This password will be sent by client or obsever that requests a certificate. The invite code will be deleted after a posivite match was found on the node. The invite codes will not be shared between the members so the same endpoint has to be used for creation an invite and for requesting a certificate.

## Authentication

Both nodes will make a challenge response handshake after the connection was established. The node creates a challenge and sends it to one that must sign it with the private key. The response will be validated with public key that is locally available via the PKI. If the validation does not match with a valid key, the connection will be closed immediately.

[Sync-up](sync-process.md)
