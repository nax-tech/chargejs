/**
 * A module for common interfaces
 * @module interface
 */

/**
 * Standard error function
 *
 * @memberof module:interface
 * @param {Object} input The input object
 * @param {Object} input.type The error type
 * @param {Object} input.message The error message
 * @param {Object} input.errors The errors array
 * @returns {Error}
 */

export const standardError = ({
  type = 'Error',
  message = 'undefined error',
  errors = []
}) => {
  const extractedErrors = []
  if (errors !== undefined && Array.isArray(errors)) {
    errors.map(err =>
      extractedErrors.push({
        [err.param]: err.msg,
        location: err.location
      })
    )
  }
  const error = new Error(type)
  error.details = message
  error.errors = extractedErrors

  return error
}