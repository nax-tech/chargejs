/**
 * A module for config functions
 * @module helpers
 */
/**
 * Extend the Error object
 * @memberof module:helpers
 * @method
 * @param {string} message the message for the exception
 * @param {string} code the code for the exception
 * @returns {Error}
 */
function CustomException (
  message = 'undefined exception',
  code = 'undefined code'
) {
  const error = new Error(message)

  error.code = code
  return error
}

CustomException.prototype = Object.create(Error.prototype)

export { CustomException }
