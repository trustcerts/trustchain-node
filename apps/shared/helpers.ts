import { Identifier } from '@trustcerts/did';

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
export function getDid(type: string, length = 22) {
  // TODO validate how to treat id (users)
  // TODO replace the tc with a dynamic string and add a sub network
  return `${Identifier.getNetwork()}:${type}:[1-9A-HJ-NP-Za-km-z]{${length}}`;
}
