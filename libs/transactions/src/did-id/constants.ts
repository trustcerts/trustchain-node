/**
 * Name of the did database connection injection.
 */
export const DID_ID_CONNECTION = 'didIdConnection';

// TODO the swagger plugin does not allow imported types from other packages so it has to be defined here
export enum RoleManageType {
  Validator = 'Validator',
  Gateway = 'Gateway',
  Observer = 'Observer',
  Client = 'Client',
}

/**
 * Types of the keys.
 */
export enum DidPublicKeyType {
  RsaVerificationKey2018 = 'RsaVerificationKey2018',
}

/**
 * Namespace of the id element.
 */
export const DID_ID_NAME = 'id';
