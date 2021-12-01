import { Identifier } from '@trustcerts/core';

/**
 * Waits a defined time in milliseconds.
 * @param time
 */
export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Returns the regular expression to validate a did
 * @param type
 * @returns
 */
export function getDid(type: string) {
  // TODO validate how to treat id (users)
  // TODO replace the tc with a dynamic string and add a sub network
  return `${Identifier.getNetwork()}:${type}:[1-9A-HJ-NP-Za-km-z]{22}`;
}
