import { Did } from '@trustcerts/core';
import { DidManagerConfigValues } from '@trustcerts/core/dist/did/DidManagerConfigValues';
import { InitDidManagerConfigValues } from '@trustcerts/core/dist/did/InitDidManagerConfigValues';

// TODO dummy class, need to be imported from sdk
export declare class DidResolver {
  static init(): void;
  protected static loadDid(
    did: Did,
    config: DidManagerConfigValues,
  ): Promise<void>;
  public static load(
    id: string,
    config: InitDidManagerConfigValues,
  ): Promise<Did>;
}
