/**
 * Defines the keys to change elements of did documents that include
 */

export class DidManage<Type> {
  /**
   * Includes rules to add a list of objects that will be appended.
   */
  add?: Type[];

  /**
   * List of did that should be removed
   */
  remove?: string[];
}
