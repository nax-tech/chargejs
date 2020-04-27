const allowedEnvironments = ['development', 'dev', 'stage', 'production']
const allowedPackages = ['payments', 'identity']
/**
 *
 * @param {string} environment the environment the app is running, ex: development, dev, stage, production
 * @param {string} app the app. This refers to the package, payments, identity
 * @throws Will throw an error if the environment or app are incorrect. This will crash the app
 * @returns {string}
 */
const getRedisPrefix = (environment, app) => {
  if (!allowedEnvironments.includes(environment)) {
    throw new Error(`Invalid environment for Redis prefix: ${environment}`)
  }
  if (!allowedPackages.includes(app)) {
    throw new Error(`Invalid package for Redis prefix: ${app}`)
  }
  return `${environment}:${app}:`
}

exports.getPrefix = getRedisPrefix
