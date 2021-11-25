# Consensus

The consensus decides if a block is valid and persisted.

## Start the round

Firstly it is checked, whether there are enough validators to start the consensus. For this
the configured validator minimum is used. If there are enough validators, the node determines
the proposer and then the round is started. If there are not enough validators nothing is done,
so the node waits for another node to connect to the blockchain to start a new attempt to start
the consensus.

## Proposer

At the beginning of the round the proposer creates the block. It then proposes the block, which
means it sends the block (via an event) to the other validators and then starts listening for the
responses. \
When all the other validators responded, the signatures are collected and shared with the other
validators to be persisted. Then the block is broadcasted to the gateways and then persisted.
After that a new round is started.

## Validator

...

# Open questions

- Are there any further questions that need to be answered?

# TODOS

- add TODOs
