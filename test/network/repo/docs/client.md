# Client Connection
A client is able to interact with the hash module of a blockchain. It is allowed to write a signed hash to the chain and also revoke it in the future.

Write requests can only be sent to node that has the gateway/gateway role. They validate incoming transactions and will send them to then validators to persist them. Only transactions that are signed with a valid key will be accepted. Each gateway can be used to persist a new transaction to the network.

Read requests can only be sent to nodes with a observer role. The requests don't need any kind of authentication. All observer nodes are full nodes so each node will return the same result for a read request.


## Registration
Each transaction has to be signed with a valid key. To get this key, a new did has to be registered on the blockchain.
A registration can only be requested to the node that created the invitation.

A json post request to `did/create` with the following parameters is required:

```json
{
  "identifier": "did:tc:2NPMcUonutLgvkZEA9ozVj",
  "secret": "cryptoSecretKey",
  "publicKey": {
    "key_ops": [
      "verify"
    ],
    "kty": [
      "RSA"
    ],
    "n": "zvbICKrRLlnDWuTXRwWV9nsaiYCaLCNiNF1WmbsWFXHbT9AhyYDbIh_KLI0y5vpYTIfdneRYeNWjkldzZ_J3xZDJ9zUdxHZGXUa9j-NHInmKsYVPDhTYTbTEmDQ2COGKv26klNkyNFKS1Sap8Q7y3jyZQvV4fVd4KynpkJirpDRoDS4jeqPrZKjXQdLxmLBnBiUuD7V2phy5PFBxTsnX6wkZiWJKRRzq6CnavlgeieLgCUrsD6fmmV7B5MtJJ-fdrLxXFXXDaD9d82ZFmM24dqaMkwLvMt22xEaz27WoYftUJJIbYGNec4qTTzacEv_YcYgR8YIXQSpnviXsZ0mqPw",
    "e": "AQAB",
    "alg": "RS256"
  }
}
```
- identifier: the identifier that was passed in the invite request
- secret: the secret that was passed in the invite request
- publicKey: a public key as [json web key](https://tools.ietf.org/html/rfc7517).

Requirements for the keypair:
- has to be an [RSA algorithm](https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedKeyGenParams)
- a minimum length of 2048
- use SHA-256 for the hash algorithm.
```ts
const params: RsaHashedKeyGenParams = {
  name: 'RSASSA-PKCS1-v1_5',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256",
}
```

The gateway will create a did transaction and persist it to the ledger. 
The response of the request includes the created transaction and the id of your registered key at
`transaction.value.verificationMethod.add[0].id` like `did:tc:2NPMcUonutLgvkZEA9ozVj#8aBeCwRGWN7vKIEDpw3jLTX3PEQEKolzXnUKRM/bL+A=	`. This identity is required to
issue transactions that can be validated with the correct key since a did can have multiple keys.

If you forgot your identity you can request `/did/{id}` at a observer to receive the information about your did where id is your identifier. It will return all transactions that updated your did on the ledger.

# Sign hash

The gateway endpoint`/hash/create` will accept transaction including a signed hash:
```json
{
  "version": 1, //current version of the transaction schema
  "type": "HashCreation", // type of the transaction
  "value": {
    "hash": "9991d650bd700b85f15ec25e0d0275cfa988a4401378b9e3b95c8fe8d1a5b61e", // hash value endcoded as hex
    "algorithm": "sha256" // used hash algorithm, only sha256 is allowed right now
  },
  "metadata": {
    "date": 1612859264 // unix timestamp
  },
  "signature": {
    "type": "single", // type of the signature
    "values": [
      {
        "identifier": "did:tc:2NPMcUonutLgvkZEA9ozVj#8aBeCwRGWN7vKIEDpw3jLTX3PEQEKolzXnUKRM/bL+A=", // id of the key that was used to sign the values
        "signature": "ciFrFBnzJSzdor0FnMSUHHcdwlYFYuiB2SyWhmlz7/eEIhNPhtUHyUIk2MF/VXIU2darzqPeEPOYh3C+sAVHt3walxJKuq7xzpaGzpQRiYRiI0AxBb3+jyzCa0oRa7thbZb0NW3P6D0b5o4PFRRH9ya1iWaXJMtT+nsaz8WMyG4=" // signature
      }
    ]
  }
}
```

### Calculating the hash
The value that should be singed includes multiple values:
```ts
const value = JSON.stringify({
  date: transaction.metadata.date,
  value: {
    algorithm: transaction.value.algorithm,
    hash: transaction.value.hash
  },
});
```
The json object has to be a sorted string, otherwise the hashes won't match when compared by the nodes:
```ts
export async function signInput(value: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const signature = await subtle.sign(defaultAlgo.name, privateKey, encoder.encode(value))
  return Buffer.from(signature).toString('hex')
}
```

# Revoke hash
Equal to the signing process, but the request has to be sent to the  `/hash/revoke` endpoint and the type of the transaction has to be `HashRevocation`. The revocation only works if the did of the key matches with the key that signed the hash in the first place.

# Get hash

To check if a hash was singed the hash can be requested against the observer `/hash/{hash}` endpoint. A 404 response tells that no transaction was found for the hash.

```json 
{
  "signature": [
    {
      "identifier": "did:tc:2NPMcUonutLgvkZEA9ozVj#8aBeCwRGWN7vKIEDpw3jLTX3PEQEKolzXnUKRM/bL+A=",
      "signature": "ciFrFBnzJSzdor0FnMSUHHcdwlYFYuiB2SyWhmlz7/eEIhNPhtUHyUIk2MF/VXIU2darzqPeEPOYh3C+sAVHt3walxJKuq7xzpaGzpQRiYRiI0AxBb3+jyzCa0oRa7thbZb0NW3P6D0b5o4PFRRH9ya1iWaXJMtT+nsaz8WMyG4="
    }
  ],
  "block": {
    "id": 69,
    "createdAt": 1612859264
  },
  "hash": "string",
  "hashAlgorithm": "string",
  "createdAt": 1612859264,
  "revokedAt": 0
}
```

- createdAt flag tells when the hash was created on the chain.
- revokedAt flag tells when the signature of the hash was revoked.
