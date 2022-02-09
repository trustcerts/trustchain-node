import { DidDocument } from '@shared/did/did-document';
import { IDidIdDocument } from '@trustcerts/core';

/**
 * Did document based on the transactions.
 */

export class DidTemplateDocument
  extends DidDocument
  implements IDidIdDocument {}
