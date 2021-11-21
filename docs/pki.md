# Issuer Reference

an issuer can be identified be a unique string. Since there is no way that two different networks will communicate with
each other, they only have to be unique in the network.

## style

it would be easier to set a human friendly name for the identifier. On the other hand following a algorithm to create
the ids it's following a strait pattern. It also reduces the risk to put it critical information and allows a change
between two owners.

# Signature reference

an issuer could have multiple keys like it's designed in the did document. This allows special use cases where an issuer
has to perform a multi signature where the keys can be stored in different systems (one on the server and on offline for
higher protection).

Keys can be referenced by the diddoc style `did_id#key_id` where every key id has to be unique.

Scenarios:

- a new request is incoming: ask for the key material and check if it is still active
- key at a defined time: check the logs of the key and if the given timestamp is in one of the time windows

# Administrating a member

A transaction can include a key and a id. If the id does not exist yet, it will be handled as a creation, if already
preset it is an update.
