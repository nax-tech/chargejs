/**
 * A module for common interfaces
 * @module interface
 */

/**
 * @typedef ErrorInfo
 * @type {Object}
 * @property {string} param The error param name
 * @property {string} msg The error message
 * @property {string} location The error location
 */

/**
 * Standard error function
 *
 * @memberof module:interface
 * @param {Object} input The input object
 * @param {string} input.type The error type
 * @param {string} input.message The error message
 * @param {ErrorInfo[]} input.errors The errors array
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
