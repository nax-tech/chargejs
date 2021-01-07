/**
 * A domain type module
 * @module domain
 */

/**
 * Creates an domain layer Base class
 * @class BaseDomain
 * @memberof module:domain
 *
 */

export class BaseDomain {
  /**
   * add userId
   * @memberof module:domain.BaseDomain
   * @param {string} id user uuid
   * @returns {void}
   */
  addUserId(id) {
    return this.set('userId', id)
  }

  /**
   * Sets the masked field by x'ing out all digits except last 4
   * @memberof module:domain.BaseDomain
   * @param {string} number the account number as a string
   */
  setMasked(number = '1234567890') {
    return this.set(
      'masked',
      number.slice(0, -4).replace(/./g, 'x') + number.slice(-4)
    )
  }

  /**
   * sanitizes an object with values to update to prevent updating
   * a value that is not allowed to be updated
   * @memberof module:domain.BaseDomain
   * @param {object} fields the object with the fields to update
   * @returns {object}
   */
  sanitize(fields = {}, allowedUpdatableFields = []) {
    const update = {}
    allowedUpdatableFields.forEach(field => {
      if (field in fields) {
        update[field] = fields[field]
      }
    })
    return update
  }

  /**
   * sets the meta field
   * @memberof module:domain.BaseDomain
   * @returns {object}
   */
  setMeta(metaObject) {
    return this.set('meta', metaObject)
  }
}

export default BaseDomain