/**
 * A module for the redis functionality
 * @module redis
 */
const allowedEnvironments = ['development', 'dev', 'stage', 'production']
const allowedPackages = [
  'api-gateway',
  'payments',
  'identity',
  'notifications',
  'profiles',
  'users',
  'payments-proxy'
]
/**
 * Gets the allowed prefix for redis
 * @memberof module:redis
 * @method
 * @param {string} environment the environment the app is running, ex: development, dev, stage, production
 * @param {string} app the app. This refers to the package, payments, identity
 * @throws Will throw an error if the environment or app are incorrect. This will crash the app
 * @returns {string} string value with concat of environment:app
 */
export const getPrefix = (environment = undefined, app = undefined) => {
  if (!allowedEnvironments.includes(environment)) {
    throw new Error(`Invalid environment for Redis prefix: ${environment}`)
  }
  if (!allowedPackages.includes(app)) {
    throw new Error(`Invalid package for Redis prefix: ${app}`)
  }
  return `${environment}:${app}:`
}
