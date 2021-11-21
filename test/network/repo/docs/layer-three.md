# Layer three
Layer three members are no nodes of the blockchain system, but interact with the blockchain with the help of layer two.
Every member from layer three can send read requests to one of the observers to get parsed information from the blockchain,
but only members with a signed key can send write requests to an gateway, so the transaction will be added to the blockchain.

# Receive an invitation
A member that want to write to the blockchain needs a signed key. To get this key an [invitation token](invite.md) from
an gateway from the second layer is required. This token will be sent to the gateway http endpoint to get the own key
signed.
