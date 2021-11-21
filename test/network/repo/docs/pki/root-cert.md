# Root certificate
This certificate builds the top-level of the public key hierarchy. It includes a list of all public keys of the current
validators. Each validator signed the list of public keys to validate the access to correct the private key.

There can be only one active root certificate so every new certificate will mark the old one as invalid for the future.

Each node will parse the root certificate and update the certificate database. Since the nodes are using a socket connection
that stays open the nodes will close every validator connection that identifier is not included in the latest
root certificate.
