export enum TransactionType {
  // Done by clients
  HashCreation = 'HashCreation',
  HashRevocation = 'HashRevocation',
  // Security Features
  SecurityLimit = 'SecurityLimit',
  SecurityRecaptcha = 'SecurityRecaptcha',

  // DID
  Did = 'Did',

  // VC
  SchemaCreation = 'SchemaCreation',
  ClaimDefinition = 'ClaimDefinition',
  RevocationRegistryCreation = 'RevocationRegistryCreation',
  RevocationEntry = 'RevocationEntry',

  // Template
  Template = 'Template',
}
